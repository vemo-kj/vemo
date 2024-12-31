import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SubtitleDto } from './dto/subtitle.dto';
import { SummaryResultDto } from './dto/summary-result.dto';
import { Summary } from './entity/summarization.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Summaries } from './entity/summaries.entity';

@Injectable()
export class SummarizationService {
    private readonly openai: OpenAI;

    // memoRepository는 여기에서 @InjectRepository를 사용해 주입
    constructor(
        @InjectRepository(Summaries)
        private summariesRepository: Repository<Summaries>,

        @InjectRepository(Summary)
        private summaryRepository: Repository<Summary>,

        private configService: ConfigService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'), // 여기 수정
        });
    }

    async extractSummary(subtitles: SubtitleDto[], videoid: string): Promise<SummaryResultDto[]> {
        if (await this.findSummary(videoid)) {
            return this.getSummary(videoid);
        } else {
            const formattedText = this.formatSubtitles(subtitles);
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
            const result: SummaryResultDto[] = this.parseTimestampedText(
                response.choices[0]?.message?.content,
            ).map(([timestamp, content]) => new SummaryResultDto(timestamp, content));
            await this.createSummaries(videoid, result);
            return result;
        }
    }
    catch(error) {
        throw new BadRequestException(`요약 생성 실패: ${error.message}`);
    }

    // 타임라인과 함께 자막 텍스트 결합
    private formatSubtitles(subtitles: SubtitleDto[]): string {
        return subtitles.map(sub => `[${sub.startTime} ~ ${sub.endTime}] ${sub.text}`).join('\n');
    }

    // 자막 텍스트에서 타임스탬프와 내용을 추출하는 함수
    private parseTimestampedText(text: string): [string, string][] {
        const regex = /\[(\d{1,2}:\d{2})\](.*?)\s*(?=\[\d{1,2}:\d{2}\]|$)/g;
        let matches;
        const result: [string, string][] = [];
        while ((matches = regex.exec(text)) !== null) {
            result.push([matches[1], matches[2].trim()]);
        }

        return result;
    }

    // 요약본 DB에 저장 (Summaries & Summary)
    private async createSummaries(
        videoid: string,
        result: { timestamp: string; summary: string }[],
    ): Promise<void> {
        const newSummaries = this.summariesRepository.create({
            videoid,
            summaries: result.map(data =>
                this.summaryRepository.create({
                    timestamp: this.convertToTime(data.timestamp),
                    summary: data.summary,
                }),
            ),
        });

        await this.summariesRepository.save(newSummaries);
    }

    private async findSummary(videoid: string): Promise<boolean> {
        const existingSummary = await this.summariesRepository.findOne({
            where: { videoid },
        });

        return existingSummary ? true : false;
    }

    private async getSummary(videoid: string): Promise<any[]> {
        const existingSummaries = await this.summariesRepository.findOne({
            where: { videoid },
            relations: ['summaries'],
        });

        if (!existingSummaries) return [];

        return existingSummaries.summaries.map(summary => {
            const date = new Date(summary.timestamp);
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return {
                ...summary,
                timestamp: `${minutes}:${seconds}`, // timestamp를 mm:ss로 변환
            };
        });
    }

    private convertToTime(timestamp: string): Date {
        const [minutes, seconds] = timestamp.split(':').map(Number);
        const date = new Date();
        date.setHours(0, minutes, seconds, 0);
        return date;
    }
}
