import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { Subtitle } from './subtitle.interface';
import { SubtitleParser } from './utils/subtitlesParser.util';
import { exec } from 'child_process';

@Injectable()
export class SubtitlesService {
    private tempDir = path.join(__dirname, '../..', 'temp');

    constructor() {
        this.ensureTempDir();
    }

    // temp 디렉터리 자동 생성
    private ensureTempDir(): void {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
            console.log(`temp 디렉터리 생성: ${this.tempDir}`);
        }
    }

    async getVideoSubtitles(url: string): Promise<Subtitle[]> {
        try {
            const videoId = this.getVideoId(url);

            if (!videoId) {
                throw new Error('유효하지 않은 URL입니다.');
            }

            await this.downloadSubtitles(videoId);
            const subtitlePath = this.getSubtitlePath(videoId);

            if (!fs.existsSync(subtitlePath)) {
                throw new Error('자막 파일이 존재하지 않습니다.');
            }

            const subtitles = SubtitleParser.parseFromFile(subtitlePath);

            console.log(subtitles);

            return subtitles;
        } catch (error) {
            throw new Error(`자막 다운로드 중 오류 발생: ${error.message}`);
        }
    }

    private downloadSubtitles(videoId: string): Promise<void> {
        const command = `yt-dlp --write-auto-sub --sub-lang ko --skip-download --output "${this.tempDir}/${videoId}.ko.vtt" "https://www.youtube.com/watch?v=${videoId}"`;

        console.log(`실행 명령어: ${command}`); // 디버깅용 로그 추가

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('자막 다운로드 실패:', stderr);
                    reject(new Error(`자막 다운로드 실패: ${stderr || error.message}`));
                } else {
                    console.log('자막 다운로드 성공:', stdout);
                    resolve();
                }
            });
        });
    }

    private getVideoId(url: string): string | null {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId || null;
    }

    private getSubtitlePath(videoId: string): string {
        const basePath = path.join(this.tempDir, `${videoId}.ko.vtt`);

        // 확장자 중복 방지 (ko.vtt.ko.vtt 파일 확인)
        if (fs.existsSync(`${basePath}.ko.vtt`)) {
            return `${basePath}.ko.vtt`;
        }

        return basePath;
    }

    private cleanUp(filePath: string): void {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`파일 삭제 완료: ${filePath}`);
        }
    }
}
