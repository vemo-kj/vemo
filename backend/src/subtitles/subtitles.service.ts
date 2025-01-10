import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Subtitle } from './subtitle.interface';
import { SubtitleParser } from './utils/subtitleParser.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubtitlesService {
    private readonly tempDir: string;
    private readonly residentialProxy: string;

    // tempDir 경로 설정  (추후 aws s3로 변경)
    constructor(private readonly configService: ConfigService) {
        this.tempDir = path.join(__dirname, '../..', 'temp');
        this.residentialProxy = this.configService.get<string>('RESIDENTIAL_PROXY') || '';
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
        const maxRetries = 3;
        let retryCount = 0;

        const tryDownload = async (): Promise<void> => {
            return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Download attempt ${retryCount + 1} failed:`, stderr);
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Retrying download (${retryCount}/${maxRetries})...`);
                            setTimeout(() => {
                                tryDownload().then(resolve).catch(reject);
                            }, 5000); // 5초 대기 후 재시도
                        } else {
                            reject(new Error(`Failed after ${maxRetries} attempts: ${stderr}`));
                        }
                    } else {
                        resolve();
                    }
                });
            });
        };
        try {
            await tryDownload();
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }

    // yt-dlp 명령어 생성
    private buildYtDlpCommand(videoId: string): string {
        const proxyOption = this.residentialProxy ? `--proxy ${this.residentialProxy}` : '';
        return `yt-dlp \
            ${proxyOption} \
            --write-auto-sub \
            --sub-lang ko \
            --skip-download \
            --output "${this.tempDir}/${videoId}.ko.vtt" \
            "https://www.youtube.com/watch?v=${videoId}"`;
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
