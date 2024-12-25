import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Subtitle } from './interfaces/subtitle.interface';

const execPromise = promisify(exec);

@Injectable()
export class SummaryService {
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

            // 타임스탬프 라인 확인 (00:00:00.000 --> 00:00:00.000)
            const timeMatch = line.match(
                /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/,
            );
            if (timeMatch) {
                currentSubtitle.startTime = timeMatch[1];
                currentSubtitle.endTime = timeMatch[2];
                continue;
            }

            // 자막 텍스트 처리
            if (line.trim() && currentSubtitle.startTime) {
                currentSubtitle.text = currentSubtitle.text
                    ? `${currentSubtitle.text} ${line.trim()}`
                    : line.trim();
            }

            // 빈 줄이면 현재 자막 저장
            if (line.trim() === '' && currentSubtitle.startTime && currentSubtitle.text) {
                subtitles.push(currentSubtitle as Subtitle);
                currentSubtitle = {};
            }
        }

        // 마지막 자막 처리
        if (currentSubtitle.startTime && currentSubtitle.text) {
            subtitles.push(currentSubtitle as Subtitle);
        }

        return subtitles;
    }
}
