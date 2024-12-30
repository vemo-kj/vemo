import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Subtitle } from './subtitle.interface';
import { SubtitleParser } from './utils/subtitleParser.util';

@Injectable()
export class SubtitlesService {
    private readonly tempDir: string;

    // tempDir 경로 설정  (추후 aws s3로 변경)
    constructor() {
        this.tempDir = path.join(__dirname, '../..', 'temp');
    }

    // subtitle service 로직 구현
    async getVideoSubtitles(url: string): Promise<Subtitle[]> {
        const videoId = this.extractVideoId(url);
        await this.downloadSubtitles(videoId);
        const subtitlePath = this.getSubtitlePath(videoId);
        const subtitles = await this.processSubtitles(subtitlePath);
        return subtitles;
    }

    // 전달받은 url로부터  videoId 추출
    private extractVideoId(url: string): string {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId;
    }

    // yt-dlp 를 사용하여 자막 다운로드
    private async downloadSubtitles(videoId: string): Promise<void> {
        const command = this.buildYtDlpCommand(videoId);

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('자막 다운로드 실패:', stderr);
                    reject(new Error(stderr || error.message));
                }
                resolve();
            });
        });
    }

    // yt-dlp 명령어 생성
    private buildYtDlpCommand(videoId: string): string {
        return `yt-dlp --write-auto-sub --sub-lang ko --skip-download --output "${this.tempDir}/${videoId}.ko.vtt" "https://www.youtube.com/watch?v=${videoId}"`;
    }

    // 자막 파일 경로 생성
    private getSubtitlePath(videoId: string): string {
        const basePath = path.join(this.tempDir, `${videoId}.ko.vtt`);

        if (fs.existsSync(`${basePath}.ko.vtt`)) {
            return `${basePath}.ko.vtt`;
        }

        return basePath;
    }

    // 자막 파일 전처리 후 삭제
    private async processSubtitles(subtitlePath: string): Promise<Subtitle[]> {
        const subtitles = SubtitleParser.parseFromFile(subtitlePath);
        this.cleanUp(subtitlePath);
        return subtitles;
    }

    // 자막 파일 삭제
    private cleanUp(filePath: string): void {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}
