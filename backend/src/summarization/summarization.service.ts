import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Subtitle } from 'src/subtitles/subtitle.interface';

@Injectable()
export class SummarizationService {
    private readonly openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async extractSummary(subtitles: Subtitle[]): Promise<[string, string][]> {
        // 타임라인과 함께 자막 텍스트 결합
        const formattedText = subtitles
            .map(sub => `[${sub.startTime} ~ ${sub.endTime}] ${sub.text}`)
            .join('\n');

        // 주요 요약 내용 추출
        const response = await this.openai.chat.completions.create({
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

        // 타임스탬프와 텍스트 추출 후 Subtitle[]으로 변환
        const result = this.parseTimestampedText(response.choices[0]?.message?.content);

        return result.length > 0 ? result : []; // Subtitle[] 배열 반환
    }
    catch(error) {
        console.error('요약 생성 오류:', error);
        throw new Error(`요약 생성 실패: ${error.message}`);
    }

    // 자막 텍스트에서 타임스탬프와 내용을 추출하는 함수
    private parseTimestampedText(text: string): [string, string][] {
        const regex = /\[(\d{1,2}:\d{2})\](.*?)\s*(?=\[\d{1,2}:\d{2}\]|$)/g;
        let matches;
        const result: [string, string][] = [];

        // 정규식 매칭을 통해 변환
        while ((matches = regex.exec(text)) !== null) {
            result.push([matches[1], matches[2].trim()]);
        }

        return result;
    }
}
