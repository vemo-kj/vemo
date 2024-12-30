import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Subtitle, SubtitleResponse } from './interfaces/subtitle.interface';
import { SubtitleParser } from './utils/subtitleParser.util';

@Injectable()
export class SubtitlesService {
    private readonly tempDir: string;

    constructor() {
        this.tempDir = path.join(__dirname, '../..', 'temp');
        this.ensureTempDir();
    }

    private ensureTempDir(): void {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async getVideoSubtitles(url: string): Promise<SubtitleResponse> {
        try {
            const videoId = this.extractVideoId(url);
            await this.downloadSubtitles(videoId);
            const subtitlePath = this.getSubtitlePath(videoId);
            const subtitles = await this.processSubtitles(subtitlePath);

            return {
                subtitles,
                videoId,
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    private extractVideoId(url: string): string {
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (!videoId) {
            throw new BadRequestException('유효하지 않은 YouTube URL입니다.');
        }
        return videoId;
    }

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

    private buildYtDlpCommand(videoId: string): string {
        return `yt-dlp --write-auto-sub --sub-lang ko --skip-download --output "${this.tempDir}/${videoId}.ko.vtt" "https://www.youtube.com/watch?v=${videoId}"`;
    }

    private async processSubtitles(subtitlePath: string): Promise<Subtitle[]> {
        if (!fs.existsSync(subtitlePath)) {
            throw new NotFoundException('자막 파일을 찾을 수 없습니다.');
        }

        try {
            const subtitles = SubtitleParser.parseFromFile(subtitlePath);
            this.cleanUp(subtitlePath);
            return subtitles;
        } catch (error) {
            throw new Error('자막 처리 중 오류가 발생했습니다.');
        }
    }

    private cleanUp(filePath: string): void {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('파일 삭제 중 오류:', error);
        }
    }

    private handleError(error: any): never {
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;
        }
        throw new Error(`자막 처리 중 오류 발생: ${error.message}`);
    }

    private getSubtitlePath(videoId: string): string {
        const basePath = path.join(this.tempDir, `${videoId}.ko.vtt`);

        if (fs.existsSync(`${basePath}.ko.vtt`)) {
            return `${basePath}.ko.vtt`;
        }

        return basePath;
    }
}
