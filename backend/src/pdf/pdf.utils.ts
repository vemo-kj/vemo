import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

interface Summary {
    timestamp: string;
    summary: string;
}

@Injectable()
export class AIUtils {
    private static openai: OpenAI;
    private static isInitialized = false;

    constructor(private configService: ConfigService) {
        this.initializeOpenAI();
    }

    private initializeOpenAI() {
        if (!AIUtils.isInitialized) {
            const apiKey = this.configService.get<string>('OPENAI_API_KEY');
            AIUtils.openai = new OpenAI({ apiKey });
        }
    }

    /**
     * 주어진 자막 데이터를 AI를 통해 요약 생성
     */
    static async extractSummary(
        summaries: Summary[],
    ): Promise<{ timestamp: string; content: string }[]> {
        const formattedSummaries = summaries
            .map(item => `[${item.timestamp}] ${item.summary}`)
            .join('\n');

        try {
            const response = await AIUtils.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `
                        지금 주어진 summaries를 주요 내용으로 메모를 하는데, 내용이 너무 부족합니다. 
                        살을 더 붙여주세요
                      `,
                    },
                    {
                        role: 'user',
                        content: `다음 자막에서 주요 내용을 추출해주세요:\n${formattedSummaries}`,
                    },
                ],
                max_tokens: 4000,
                temperature: 0.3,
                top_p: 0.8,
            });

            return AIUtils.parseTimestampedText(response.choices[0]?.message?.content || '');
        } catch (error) {
            console.error('💡 OpenAI API 호출 실패:', error);
            throw new BadRequestException(`요약 생성 실패: ${error.message}`);
        }
    }

    /*
     * 응답에서 타임스탬프와 내용을 파싱
     */
    private static parseTimestampedText(content: string): { timestamp: string; content: string }[] {
        const lines = content.split('\n');
        const result: { timestamp: string; content: string }[] = [];

        for (const line of lines) {
            const match = line.match(/\[(\d{2}:\d{2})\](.*)/);
            if (match) {
                result.push({ timestamp: match[1], content: match[2].trim() });
            }
        }

        return result;
    }
}
