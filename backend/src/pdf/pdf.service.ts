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
  margin: 20px; /* 페이지의 여백을 추가 */
  padding: 40px 20px; /* 위아래 여백을 강조하고 양옆도 적당히 설정 */
  line-height: 1.6;
  color: #333;
}

.timestamp {
  font-size: 12px;
  font-weight: bold;
  color: #007bff; /* 파란색 */
  padding: 5px 10px; /* 안쪽 여백 */
  border-radius: 5px; /* 둥근 모서리 */
  display: inline-block; /* 텍스트 크기에 맞게 줄이 조정됨 */
  margin-bottom: 10px; /* 아래쪽 여백 */
}

.timestamp .label {
  font-size: 10px; /* 내 메모를 작게 표시 */
  color: #555; /* 회색 */
  font-weight: normal; /* 굵기 조정 */
  margin-left: 5px; /* 타임스탬프와 간격 추가 */
}

.memo {
  font-size: 16px;
  font-weight: normal;
  color: #555; /* 소타이틀 색상 */
  margin: 20px 0; /* 상하 간격을 충분히 추가 */
  border-left: 4px solid #ccc; /* 강조선 */
  padding-left: 10px;
}

.summaries {
  font-size: 18px;
  font-weight: bold;
  color: #222; /* 중타이틀 색상 */
  margin: 30px 0; /* 상하 간격을 넉넉히 추가 */
  border-left: 4px solid #ffd700; /* 노란색 강조선 */
  padding-left: 10px;
}

.capture {
  margin: 30px 0; /* 상하 간격 */
}

.capture .image img {
  max-width: 80%;
  max-height: 300px;
  border-radius: 5px;
  margin-top: 10px;
  display: inline-block;
}

.error-message {
  font-size: 14px;
  color: #d9534f; /* 오류 메시지 빨간색 */
  margin-top: 5px;
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
        <div class="timestamp">[${item.timestamp}]<span class="label"> 내 메모</span></div>
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
            <div class="timestamp">[${item.timestamp}] <span class="label"> 이미지 </span></div>
            <div>이미지를 불러올 수 없습니다.</div>
        </div>`;
                }
            } else if (item.type === 'summaries' && 'summary' in item) {
                htmlContent += `
    <div class="summaries">
        <div class="timestamp">[${item.timestamp}] <span class="label"> 추가 내용</span></div>
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
