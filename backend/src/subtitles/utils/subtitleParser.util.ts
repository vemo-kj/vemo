import * as fs from 'fs';
import { Subtitle } from '../interfaces/subtitle.interface';

export class SubtitleParser {
    static parseFromFile(filePath: string): Subtitle[] {
        const content = fs.readFileSync(filePath, 'utf-8');
        return this.parseContent(content);
    }

    static parseContent(content: string): Subtitle[] {
        const lines = content.split('\n');
        const subtitles: Subtitle[] = [];
        let currentSubtitle: Partial<Subtitle> = {};

        for (const line of lines) {
            if (line.includes('WEBVTT')) continue;

            const timeMatch = line.match(
                /(\d{2}):(\d{2}):(\d{2})\.\d{3} --> (\d{2}):(\d{2}):(\d{2})\.\d{3}/,
            );
            if (timeMatch) {
                if (currentSubtitle.startTime) {
                    subtitles.push(currentSubtitle as Subtitle);
                }

                // 시간 변환 로직 추가
                const startMinutes = parseInt(timeMatch[2], 10);
                const startSeconds = parseInt(timeMatch[3], 10);
                const endMinutes = parseInt(timeMatch[5], 10);
                const endSeconds = parseInt(timeMatch[6], 10);

                currentSubtitle = {
                    startTime: `${startMinutes}:${String(startSeconds).padStart(2, '0')}`,
                    endTime: `${endMinutes}:${String(endSeconds).padStart(2, '0')}`,
                    text: '',
                };
                continue;
            }

            if (line.trim() && currentSubtitle.startTime) {
                currentSubtitle.text = line.trim();
            }
        }

        if (currentSubtitle.startTime) {
            subtitles.push(currentSubtitle as Subtitle);
        }

        return subtitles;
    }
}
