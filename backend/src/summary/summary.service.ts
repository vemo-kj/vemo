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
            console.log('임시 디렉토리 경로:', tempDir);

            // yt-dlp 명령어 실행 전 로깅
            const command = `yt-dlp --write-auto-sub --sub-lang ko --skip-download --output "${tempDir}/%(id)s.%(ext)s" "${url}"`;
            console.log('실행할 명령어:', command);

            const { stdout, stderr } = await execPromise(command);
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);

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
            console.error('자막 다운로드 오류:', error);
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
            // 타임라인과 함께 자막 텍스트 결합
            const formattedText = subtitles
                .map(sub => `[${sub.startTime} ~ ${sub.endTime}] ${sub.text}`)
                .join('\n');

            console.log('Formatted text:', formattedText); // 디버깅용 로그

            try {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `당신은 영상 내용을 요약하는 도우미입니다. 
                            주어진 자막을 다음 형식으로 요약해주세요:
                            
                            1. 주요 카테고리 정리를 해주세요.
                            2. 주요 카테고리를 기반으로 카테고리의 세부 내용으로 정리해주세요.
                            3. 2번 내용의 정리된 내용의 타임라인을 맞춰주세요. 
                            4. 카테고리별 점검 퀴즈도 1문제씩 만들어줘.
                            
                            다음은 예시입니다. 
                            "
                            00:00 - 01:04:
                            M1 맥북 구매 고민에 대한 시작.
                            다양한 사용 사례 언급 (게이밍, 영상 편집 등).
                            M1 맥북의 장점과 주목할 만한 기능 언급.
                            01:04 - 02:12:

                            M1 칩의 성능에 대한 개인적 경험 공유.
                            게임 및 동영상 편집에서 M1 맥북이 효율적이라는 점 강조.
                            기존 인텔 기반 맥북과의 차이점 언급.
                            02:12 - 03:14:

                            M1 맥북의 배터리 수명과 발열 문제에 대한 논의.
                            소프트웨어 호환성 문제 언급 (특히 게임 및 특정 앱).
                            ARM 기반의 전환으로 인한 초기 불안정성 지적.
                            03:14 - 04:23:

                            M1 맥북의 디자인 및 하드웨어 특징 설명.
                            개인적인 사용 패턴과 그에 따른 장단점 비교.
                            M1 맥북을 추천하는 상황과 아닌 경우 설명.
                            04:23 - 05:30:

                            가격 대비 성능(가성비)에 대한 개인적인 평가.
                            현재 M1 맥북의 위치와 미래 전망 언급.
                            시청자들에게 감사 인사 및 결론.
                            핵심 요약:
                            M1 맥북은 뛰어난 성능과 배터리 수명을 자랑하지만, 소프트웨어 호환성 문제와 초기 단계의 불안정성이 존재함. 기존 인텔 기반 맥북과의 차별성을 고려하여 구입 여부를 판단하는 것이 중요함.

                            1. M1 맥북의 가장 큰 장점으로 언급된 두 가지는 무엇인가요?

                                a) 디자인과 무게
                                b) 성능과 배터리 수명
                                c) 가격과 호환성
                                d) 키보드와 트랙패드
                            "
                            `,
                        },
                        {
                            role: 'user',
                            content: `다음 자막을 요약해주세요:\n${formattedText}`,
                        },
                    ],
                    max_tokens: 1000,
                    temperature: 0.7,
                });

                console.log('OpenAI Response:', response); // 디버깅용 로그

                return {
                    originalSubtitles: subtitles,
                    summary: response.choices[0].message.content,
                };
            } catch (openaiError) {
                console.error('OpenAI API 오류:', openaiError); // 상세 에러 로그
                throw new Error(`OpenAI API 오류: ${openaiError.message}`);
            }
        } catch (error) {
            console.error('요약 생성 오류:', error);
            throw new Error(`자막 요약 중 오류 발생: ${error.message}`);
        }
    }
}
