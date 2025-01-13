import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { HttpService } from '@nestjs/axios';
import { pdfCaptureDto, pdfMemoeDto } from './dto/pdf.dto';
import { firstValueFrom } from 'rxjs';
import { S3 } from 'aws-sdk';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Summaries } from 'src/summarization/entity/summaries.entity';
import { Summary } from 'src/summarization/entity/summarization.entity';
import { Repository } from 'typeorm';
import { Memos } from 'src/memos/memos.entity';

@Injectable()
export class PdfService {
    private readonly openai: OpenAI;

    constructor(
        private readonly httpService: HttpService,
        @Inject('S3') private readonly s3: S3,
        private configService: ConfigService,

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
        const htmlContent = await this.generateHTML(title, memos, capture, summaries);

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
    ): Promise<string> {
        const combined = [
            ...memos.map(memo => ({
                ...memo,
                type: 'memo',
                timestamp: memo.timestamp,
            })),
            ...summaries.map(summary => ({
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

        console.log('💡combined 출력 ', combined);

        let htmlContent = `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body {
                        font-family: 'Noto Sans KR', sans-serif;
                        margin: 40px;
                        line-height: 1.8;
                        background-color: #f4f6f9;
                    }
                    h1, h2 {
                        text-align: center;
                        margin: 30px 0;
                        color: #5D73E6;
                        font-size: 1.5em;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                    }
                    .memo, .capture {
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        margin: 20px auto;
                        padding: 20px;
                        max-width: 800px;
                    }
                    .timestamp {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 10px;
                    }
                    .description {
                        font-size: 18px;
                        color: #444;
                    }
                    .image {
                        text-align: center;
                        margin-top: 20px;
                    }
                    img {
                        width: 100%;
                        max-width: 600px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                    }
                </style>
            </head>
            <body>
            <h2>${title}</h2>
            `;

        for (const item of combined) {
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
