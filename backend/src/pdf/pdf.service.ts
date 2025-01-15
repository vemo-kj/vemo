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
        const formattedMemos = memos.map(memo => {
            const [minutes, seconds, milliseconds] = memo.timestamp.split(':');
            return {
                ...memo,
                timestamp: `00:${minutes}:${seconds}`,
            };
        });

        const formattedCaptures = capture.map(capture => {
            const [minutes, seconds, milliseconds] = capture.timestamp.split(':');
            return {
                ...capture,
                type: 'capture',
                timestamp: `00:${minutes}:${seconds}`,
            };
        });

        const combined = [
            ...formattedMemos.map(memo => ({
                ...memo,
                type: 'memo',
                timestamp: memo.timestamp,
            })),
            ...extractedSummaries.map(summary => ({
                ...summary,
                type: 'summaries',
                timestamp: summary.timestamp,
            })),
            ...formattedCaptures.map(capture => ({
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

        // 같은 타입의 연속된 아이템들을 그룹화
        const groupedItems = [];
        let currentGroup = [];
        let currentType = null;

        for (const item of combined) {
            if (currentType === null || currentType === item.type) {
                currentGroup.push(item);
            } else {
                if (currentGroup.length > 0) {
                    groupedItems.push({
                        type: currentType,
                        items: currentGroup,
                    });
                }
                currentGroup = [item];
            }
            currentType = item.type;
        }

        // 마지막 그룹 추가
        if (currentGroup.length > 0) {
            groupedItems.push({
                type: currentType,
                items: currentGroup,
            });
        }

        let htmlContent = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
        <style>
        @page {
            margin: 60px 40px; /* 페이지 자체의 여백 설정 */
        }

        body {
            font-family: 'Noto Sans CJK KR', serif;
            margin: 0 auto; /* body의 여백은 제거하고 페이지 여백 사용 */
            background-color: #fdfdfd;
            color: #333;
            line-height: 1.8;
        }

        /* 이미지 컨테이너 스타일 수정 */
        .capture {
            margin: 20px 0;
            text-align: center; /* 이미지 중앙 정렬 */
        }

        .capture .image {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 15px 0;
        }

        .capture .image img {
            max-width: 500px;  /* 최대 너비 제한 */
            width: 100%;      /* 반응형으로 유지 */
            height: auto;     /* 비율 유지 */
            max-height: 400px; /* 최대 높이 제한 */
            object-fit: contain; /* 비율을 유지하면서 컨테이너에 맞춤 */
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }

        .summaries div:not(.timestamp) {
            color: #2c3e50;
            font-weight: 500;
            line-height: 1.6; /* 줄간격 축소 */
            margin: 8px 0; /* 문단 간격 조정 */
        }

        /* 메모 스타일 */
        .memo {
            margin: 15px 0;
            padding: 0 15px;
        }

        /* 타임스탬프 스타일 수정 */
        .timestamp {
            margin: 12px 0 8px 0; /* 여백 축소 */
            font-size: 14px;
            font-weight: bold;
            color: #777;
        }

        h2 {
            font-weight: 700;  /* 더 두껍게 */
            font-size: 24px;
            color: #2c3e50;
            margin: 20px 0 30px 0;
            text-align: center;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
        }

        .summaries-container {
            margin: 25px 0;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #4a90e2;
            padding: 15px;
        }

        .summary-item {
            margin: 10px 0;
            padding: 5px 0;
        }

        .summary-item .timestamp {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .summary-item .content {
            color: #2c3e50;
            line-height: 1.6;
        }
        </style>

        </head>
        <body>
        <h2><strong>${title}</strong></h2>
        `;

        for (const group of groupedItems) {
            if (group.type === 'summaries') {
                htmlContent += `
                <div class="summaries-container">
                    <div class="summaries">`;

                // 모든 summary 항목을 하나의 컨테이너에 순차적으로 표시
                for (const item of group.items) {
                    htmlContent += `
                        <div class="summary-item">
                            <!-- <div class="timestamp">[${item.timestamp}]</div> -->
                            <div class="content">${item.summary}</div>
                        </div>`;
                }

                htmlContent += `
                    </div>
                </div>`;
            } else if (group.type === 'memo') {
                htmlContent += `<div class="group memo-group">`;
                for (const item of group.items) {
                    htmlContent += `
                        <div class="memo">
                            <!-- <div class="timestamp">[${item.timestamp}]</div>  -->
                            <div>${item.description}</div>
                        </div>`;
                }
                htmlContent += `</div>`;
            } else if (group.type === 'capture') {
                htmlContent += `<div class="group capture-group">`;
                for (const item of group.items) {
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
                                <!-- <div class="timestamp">[${item.timestamp}]</div> -->
                                <div class="image">
                                    <img src="${imageUrl}" alt="Captured Image" />
                                </div>
                            </div>`;
                    } catch (error) {
                        console.error(`이미지 로드 실패: ${item.image}`, error);
                        htmlContent += `
                            <div class="capture">
                                <!-- <div class="timestamp">[${item.timestamp}]</div> -->
                                <div>이미지를 불러올 수 없습니다.</div>
                            </div>`;
                    }
                }
                htmlContent += `</div>`;
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
