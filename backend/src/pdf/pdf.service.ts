import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { HttpService } from '@nestjs/axios';
import { pdfCaptureDto, pdfMemoeDto } from './dto/pdf.dto';
import { S3 } from 'aws-sdk';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Summaries } from 'src/summarization/entity/summaries.entity';
import { Summary } from 'src/summarization/entity/summarization.entity';
import { Repository } from 'typeorm';
import { Memos } from 'src/memos/memos.entity';
import { firstValueFrom } from 'rxjs';
import { AIUtils } from './pdf.utils';

@Injectable()
export class PdfService {
    private readonly openai: OpenAI;

    constructor(
        private readonly httpService: HttpService,
        @Inject('S3') private readonly s3: S3,
        private configService: ConfigService,
        private readonly aiUtils: AIUtils,

        @InjectRepository(Summaries)
        private summariesRepository: Repository<Summaries>,

        @InjectRepository(Summary)
        private summaryRepository: Repository<Summary>,

        @InjectRepository(Memos)
        private readonly memosRepository: Repository<Memos>,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    // PDF 생성
    async createMemoCapturePDF(
        title: string,
        memos: pdfMemoeDto[],
        capture: pdfCaptureDto[],
        memosId: number,
    ): Promise<Buffer> {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        const videoId = await this.getVideoId(memosId);
        const summaries = await this.getSummary(videoId);
        const htmlContent = await this.generateHTML(title, memos, capture, summaries, videoId);

        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        const pdfBuffer = Buffer.from(
            await page.pdf({
                format: 'A4',
                printBackground: true,
            }),
        );

        await browser.close();
        return pdfBuffer;
    }

    // HTML 생성
    private async generateHTML(
        title: string,
        memos: pdfMemoeDto[],
        capture: pdfCaptureDto[],
        summaries: any[],
        videoId: string,
    ): Promise<string> {
        const extractedSummaries = await AIUtils.extractSummary(summaries, videoId);
        const combined = [
            ...memos.map(memo => ({
                ...memo,
                type: 'memo',
                timestamp: memo.timestamp,
            })),
            ...extractedSummaries.map(summary => ({
                ...summary,
                type: 'summaries',
                timestamp: summary.timestamp,
            })),
            ...capture.map(capture => ({
                ...capture,
                type: 'capture',
                timestamp: capture.timestamp,
            })),
        ].sort((a, b) => {
            const timeA = a.timestamp.split(':').map(Number);
            const timeB = b.timestamp.split(':').map(Number);
            const secondsA = timeA[0] * 3600 + timeA[1] * 60 + timeA[2];
            const secondsB = timeB[0] * 3600 + timeB[1] * 60 + timeB[2];
            return secondsA - secondsB;
        });

        let htmlContent = `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                        }

                        .memo {
                        background-color: #f9f9f9;
                        border: 1px solid #ddd;
                        padding: 10px;
                        margin: 10px 0;
                        border-radius: 5px;
                        }

                        .memo .timestamp {
                        font-size: 12px;
                        color: #666;
                        }

                        .summaries {
                        background-color: #fff4d1; /* 밝은 노란색으로 강조 */
                        border: 2px solid #ffd700; /* 노란색 테두리 */
                        padding: 15px;
                        margin: 15px 0;
                        border-radius: 8px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 약간의 그림자 */
                        }

                        .summaries .timestamp {
                        font-size: 14px;
                        font-weight: bold;
                        color: #333;
                        }

                        .summaries div {
                        font-size: 16px;
                        color: #111;
                        }

                        .capture {
                        background-color: #f3f3f3;
                        border: 1px solid #ccc;
                        padding: 10px;
                        margin: 10px 0;
                        border-radius: 5px;
                        }

                        .capture .timestamp {
                        font-size: 12px;
                        color: #666;
                        }

                        .capture .image img {
                        max-width: 100%;
                        border-radius: 5px;
                        margin-top: 10px;
                        }
                </style>
            </head>
            <body>
            <h2>${title}</h2>
            `;

        for (const item of combined) {
            console.log('💡item 출력 ', item);
            if (item.type === 'memo' && 'description' in item) {
                htmlContent += `
                <div class="memo">
                    <div class="timestamp">[${item.timestamp}]</div>
                    <div>${item.description}</div>
                </div>`;
            } else if (item.type === 'capture' && 'image' in item) {
                try {
                    let imageUrl = item.image;
                    if (!item.image.startsWith('data:image')) {
                        const response = await firstValueFrom(
                            this.httpService.get(item.image, { responseType: 'arraybuffer' }),
                        );
                        const base64 = Buffer.from(response.data, 'binary').toString('base64');
                        imageUrl = `data:image/jpeg;base64,${base64}`;
                    }

                    htmlContent += `
                    <div class="capture">
                        <div class="timestamp">[${item.timestamp}]</div>
                        <div class="image">
                            <img src="${imageUrl}" alt="Captured Image" />
                        </div>
                    </div>`;
                } catch (error) {
                    console.error(`이미지 로드 실패: ${item.image}`, error);
                    htmlContent += `
                    <div class="capture">
                        <div class="timestamp">[${item.timestamp}]</div>
                        <div>이미지를 불러올 수 없습니다.</div>
                    </div>`;
                }
            } else if (item.type === 'summaries' && 'summary' in item) {
                htmlContent += `
                <div class="summaries">
                    <div class="timestamp">[${item.timestamp}]</div>
                    <div>${item.summary}</div>
                </div>`;
            }
        }

        htmlContent += `</body></html>`;
        return htmlContent;
    }

    private async getVideoId(memosId: number): Promise<string> {
        const memos = await this.memosRepository.findOne({
            where: { id: memosId },
            relations: ['video'],
        });
        return memos.video.id;
    }

    // summaries 테이블에서 videoid 가져오기
    private async getSummary(videoid: string): Promise<any[]> {
        const existingSummaries = await this.summariesRepository.findOne({
            where: { videoid },
            relations: ['summaries'],
        });

        if (!existingSummaries) return [];

        return existingSummaries.summaries.map(summary => {
            // `quiz.timestamp`이 Date 객체라면 문자열로 변환
            const timestampString =
                summary.timestamp instanceof Date
                    ? summary.timestamp.toISOString().slice(11, 19) // "HH:mm:ss" 형식
                    : summary.timestamp; // 이미 문자열인 경우 그대로 사용

            // "HH:mm:ss"에서 분:초만 추출
            const timestampParts = timestampString.split(':');
            const minutes = timestampParts[1]; // "00"
            const seconds = timestampParts[2]; // "03"

            return {
                ...summary,
                timestamp: `${minutes}:${seconds}:00`, // "00:03:00"
            };
        });
    }
}
