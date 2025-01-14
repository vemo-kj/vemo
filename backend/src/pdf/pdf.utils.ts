import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import OpenAI from 'openai';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

interface Summary {
    timestamp: string;
    summary: string;
}

@Injectable()
export class AIUtils {
    private static openai: OpenAI;
    private static isInitialized = false;
    private static configService: ConfigService;
    private static s3: S3;

    constructor(configService: ConfigService, @Inject('S3') s3: S3) {
        AIUtils.configService = configService;
        AIUtils.s3 = s3;
        this.initializeOpenAI();
    }

    private initializeOpenAI() {
        if (!AIUtils.isInitialized) {
            const apiKey = AIUtils.configService.get<string>('OPENAI_API_KEY');
            if (!apiKey) {
                throw new Error('OpenAI API 키가 설정되지 않았습니다.');
            }
            AIUtils.openai = new OpenAI({ apiKey });
            AIUtils.isInitialized = true;
        }
    }

    /**
     * 주어진 자막 데이터를 AI를 통해 요약 생성
     */
    static async extractSummary(
        summaries: Summary[],
        videoId: string,
    ): Promise<{ timestamp: string; summary: string; type: string }[]> {
        if (!AIUtils.openai) {
            throw new Error('OpenAI가 초기화되지 않았습니다.');
        }

        const formattedSummaries = summaries
            .map(item => `[${item.timestamp}] ${item.summary}`)
            .join('\n');

        try {
            const response = await AIUtils.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `지금 주어진 summaries를 주요 내용으로 메모를 하는데, 내용이 너무 부족합니다.
                                주요 내용을 중심으로 살을 붙여 상세하고 이해하기 쉬운 자료로 만들어주세요. 
                                학습자가 쉽게 이해할 수 있도록 다음을 포함해주세요: 
                                1) 요약본에 있는 타임스탬프는 메모에 꼭 포함해주세요.
                                2) 주요 개념과 정의
                                3) 실생활 예제나 코드 스니펫
                                4) 학습에 도움이 될 추가 정보`,
                    },
                    {
                        role: 'user',
                        content: `다음 요약본에서 적절하게 내용을 추가해주세요:\n${formattedSummaries}`,
                    },
                ],
                max_tokens: 4000,
                temperature: 0.3,
                top_p: 0.8,
            });

            const parsedResult = AIUtils.parseTimestampedText(
                response.choices[0]?.message?.content,
            );

            console.log('💡 parsedResult data:', parsedResult);

            // S3에 결과 업로드
            await AIUtils.uploadToS3(parsedResult, videoId);

            return parsedResult;
        } catch (error) {
            console.error('💡 OpenAI API 호출 실패:', error);
            throw new BadRequestException(`요약 생성 실패: ${error.message}`);
        }
    }

    /*
     * 응답에서 타임스탬프와 내용을 파싱
     */
    private static parseTimestampedText(
        content: string,
    ): { timestamp: string; summary: string; type: string }[] {
        const lines = content.split('\n');
        const result: { timestamp: string; summary: string; type: string }[] = [];

        for (const line of lines) {
            const match = line.match(/\[(\d{2}:\d{2}:\d{2})\](.*)/); // 타임스탬프를 시:분:초 형식으로 수정
            if (match) {
                result.push({
                    timestamp: match[1].trim(),
                    summary: match[2].trim(),
                    type: 'summaries', // 고정된 타입 'summaries' 추가
                });
            }
        }
        return result;
    }

    private static async uploadToS3(
        summaries: { timestamp: string; summary: string; type: string }[],
        videoId: string,
    ): Promise<void> {
        if (!AIUtils.s3) {
            throw new Error('S3가 초기화되지 않았습니다.');
        }

        const bucketName = AIUtils.configService.get<string>('AWS_S3_BUCKET');
        if (!bucketName) {
            throw new Error('S3 버킷 이름이 설정되지 않았습니다.');
        }

        const key = `summaries/${videoId}.json`;
        const content = JSON.stringify(summaries, null, 2);

        const params = {
            Bucket: bucketName,
            Key: key,
            Body: content,
            ContentType: 'application/json',
        };

        try {
            await AIUtils.s3.upload(params).promise();
            console.log(`✅ 요약본이 S3에 업로드되었습니다: ${bucketName}/${key}`);
        } catch (error) {
            console.error(`❌ S3 업로드 실패: ${error.message}`);
            throw new Error(`요약본 S3 업로드 실패: ${error.message}`);
        }
    }
}
