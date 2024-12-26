import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Subtitle } from './interfaces/subtitle.interface';
import { Summary } from './interfaces/summary.interface';

const execPromise = promisify(exec);

@Injectable()
export class SummaryService {
    private readonly openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    // 유튜브 영상의 자막을 가져오는 메서드
    async getVideoSubtitles(url: string): Promise<any> {
        try {
            const tempDir = path.join(__dirname, '../..', 'temp');

            // yt-dlp 명령어 실행 전 로깅
            const command = `yt-dlp --write-auto-sub --sub-lang ko --skip-download --output "${tempDir}/%(id)s.%(ext)s" "${url}"`;

            const { stdout, stderr } = await execPromise(command);

            // ffmpeg 경고는 무시하고, 실제 에러만 체크
            if (stderr && !stderr.includes('WARNING') && !stderr.includes('Downloading subtitle')) {
                console.error('Error output:', stderr);
                throw new Error('자막 다운로드 중 오류 발생');
            }

            // 비디오 ID 추출 (URL에서 직접)
            const videoId = url.split('v=')[1]?.split('&')[0];
            if (!videoId) throw new Error('올바른 YouTube URL이 아닙니다.');

            // 자막 파일 찾기
            const subtitlePath = path.join(tempDir, `${videoId}.ko.vtt`);
            if (!fs.existsSync(subtitlePath)) {
                throw new Error('자막 파일을 찾을 수 없습니다.');
            }

            // 파일 읽기 및 파싱
            const subtitleFile = fs.readFileSync(subtitlePath, 'utf-8');
            const parsedSubtitles = this.parseVtt(subtitleFile);

            // 임시 파일 정리
            fs.unlinkSync(subtitlePath);

            return parsedSubtitles;
        } catch (error) {
            throw new Error(`자막 다운로드 중 오류 발생: ${error.message}`);
        }
    }

    // VTT 파일을 파싱하여 타임스탬프와 텍스트 추출
    parseVtt(vttContent: string): Subtitle[] {
        const lines = vttContent.split('\n');
        const subtitles: Subtitle[] = [];
        let currentSubtitle: Partial<Subtitle> = {};

        for (let line of lines) {
            // WEBVTT 헤더 스킵
            if (line.includes('WEBVTT')) continue;

            // 타임스탬프 라인 확인
            const timeMatch = line.match(
                /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/,
            );
            if (timeMatch) {
                if (currentSubtitle.startTime && currentSubtitle.text) {
                    subtitles.push(currentSubtitle as Subtitle);
                }
                currentSubtitle = {
                    startTime: timeMatch[1],
                    endTime: timeMatch[2],
                    text: '',
                };
                continue;
            }

            // 자막 텍스트 처리
            if (line.trim() && currentSubtitle.startTime) {
                // HTML 태그 제거 및 타임스탬프 제거
                const cleanText = line
                    .trim()
                    .replace(/<[^>]*>/g, '') // HTML 태그 제거
                    .replace(/\<\d{2}:\d{2}:\d{2}\.\d{3}\>/g, '') // 타��스탬프 제거
                    .trim();

                if (cleanText && !subtitles.some(s => s.text === cleanText)) {
                    currentSubtitle.text = cleanText;
                }
            }
        }

        // 마지막 자막 처리
        if (currentSubtitle.startTime && currentSubtitle.text) {
            subtitles.push(currentSubtitle as Subtitle);
        }

        // 중복 제거 및 정렬
        return subtitles
            .filter((sub, index, self) => index === self.findIndex(s => s.text === sub.text))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    async summarizeSubtitles(subtitles: Subtitle[]): Promise<Summary> {
        try {
            const formattedText = subtitles
                .map(sub => `[${sub.startTime} ~ ${sub.endTime}] ${sub.text}`)
                .join('\n');

            console.log('Formatted text:', formattedText); // 디버깅용 로그

            // 1단계: 주요 내용 추출
            let extractedContent;
            try {
                const extractionResponse = await this.openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `
                            당신은 자막을 분석해 **모든 주요 내용**을 타임스탬프와 함께 추출하는 전문가입니다.  
                            주어진 자막을 **순서대로 분석**하여 중요한 정보만 간결하게 정리해 주세요.  
                            타임스탬프는 반드시 포함해야 합니다. 
                            ex) 다음은 표현 방식입니다.
                            [40:30] CSR의 동작 과정 설명: 초기 로딩은 느리지만 이후 빠른 구동 속도.
                            `,
                        },
                        {
                            role: 'user',
                            content: `다음 자막에서 주요 내용을 추출해주세요:\n${formattedText}`,
                        },
                    ],
                    max_tokens: 4000,
                    temperature: 0.3,
                    top_p: 0.8,
                });

                extractedContent = extractionResponse.choices[0].message.content;
                console.log('Extracted Content:', extractedContent); // 디버깅용 로그
            } catch (extractionError) {
                console.error('내용 추출 오류:', extractionError);
                throw new Error(`내용 추출 중 오류 발생: ${extractionError.message}`);
            }

            // 2단계: 요약 및 퀴즈 생성
            try {
                const summaryResponse = await this.openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `
                            당신은 자막의 요약 및 퀴즈 생성 전문가입니다.  
                            주어진 주요 내용을 바탕으로 다음 사항을 작성하세요:  
                            
                            1. **요약**: 자막의 주요 내용을 타임스탬프와 함께 정리하세요.  
                            2. **결론**: 영상의 핵심 메시지를 요약하세요.  
                            3. **퀴즈**: 영상의 중요 내용을 묻는 4개의 퀴즈와 타임스탬프, 정답을 작성하세요.  

                            ex) 다음 퀴즈의 예시입니다.
                            도커를 사용하여 독립된 가상 공간을 만들어 서로 다른 서비스들을 각각의 컨테이너에서 돌아갈 수 있도록 하는 기술은 무엇인가요?
                                a) 가상머신
                                b) 클라우드 컴퓨팅
                                c) 도커
                                d) 서버 관리"
                            `,
                        },
                        {
                            role: 'user',
                            content: `다음 주요 내용을 기반으로 요약과 퀴즈를 생성해주세요:\n${extractedContent}`,
                        },
                    ],
                    max_tokens: 4000,
                    temperature: 0.3,
                    top_p: 0.8,
                });

                console.log('Summary Response:', summaryResponse); // 디버깅용 로그

                return {
                    originalSubtitles: subtitles,
                    summary: summaryResponse.choices[0].message.content,
                };
            } catch (summaryError) {
                console.error('요약 생성 오류:', summaryError);
                throw new Error(`요약 생성 중 오류 발생: ${summaryError.message}`);
            }
        } catch (error) {
            console.error('요약 프로세스 전체 오류:', error);
            throw new Error(`자막 요약 중 전체 오류 발생: ${error.message}`);
        }
    }
}
