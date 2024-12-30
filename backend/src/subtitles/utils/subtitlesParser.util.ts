import * as fs from 'fs';
import * as path from 'path';
import { Subtitle } from '../subtitle.interface';
import { exec } from 'child_process';

export class SubtitleParser {
    // VTT 파일에서 자막 파싱
    static parseFromFile(filePath: string): Subtitle[] {
        const vttContent = fs.readFileSync(filePath, 'utf-8');
        return this.parseVtt(vttContent);
    }

    // VTT 텍스트 파싱
    static parseVtt(vttContent: string): Subtitle[] {
        const lines = vttContent.split('\n');
        const subtitles: Subtitle[] = [];
        let currentSubtitle: Partial<Subtitle> = {};
        let line: string;
        for (line of lines) {
            if (this.isWebVttHeader(line)) continue;

            const timeMatch = this.extractTimestamps(line);
            if (timeMatch) {
                this.addSubtitle(subtitles, currentSubtitle);
                currentSubtitle = this.createSubtitle(timeMatch);
                continue;
            }

            if (line.trim() && currentSubtitle.startTime) {
                currentSubtitle.text += `${line.trim()} `;
            }
        }

        this.addSubtitle(subtitles, currentSubtitle);
        return subtitles.length > 0
            ? subtitles
            : [{ startTime: '00:00:00.000', endTime: '00:00:00.000', text: '자막 없음' }];
    }

    // WEBVTT 헤더 체크
    private static isWebVttHeader(line: string): boolean {
        return line.includes('WEBVTT');
    }

    // 타임스탬프 추출
    private static extractTimestamps(line: string): RegExpMatchArray | null {
        return line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
    }

    // 자막 객체 생성
    private static createSubtitle(timeMatch: RegExpMatchArray): Partial<Subtitle> {
        return {
            startTime: timeMatch[1],
            endTime: timeMatch[2],
            text: '',
        };
    }

    // 자막 추가
    private static addSubtitle(subtitles: Subtitle[], subtitle: Partial<Subtitle>): void {
        if (subtitle.startTime && subtitle.text) {
            subtitles.push(subtitle as Subtitle);
        }
    }
}
