import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { HttpService } from '@nestjs/axios';
import { pdfMemoeDto, pdfCaptureDto } from './dto/pdf.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PdfService {
    constructor(private readonly httpService: HttpService) {}

    async createMemoCapturePDF(
        title: string,
        memos: pdfMemoeDto[],
        capture: pdfCaptureDto[],
    ): Promise<Buffer> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlContent = await this.generateHTML(title, memos, capture);
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

    private async generateHTML(
        title: string,
        memos: pdfMemoeDto[],
        capture: pdfCaptureDto[],
    ): Promise<string> {
        const combined = [
            ...memos.map(memo => ({
                ...memo,
                type: 'memo',
                timestamp: memo.timestamp,
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

    private async fetchBase64FromUrl(url: string): Promise<{ base64: string; mimeType?: string }> {
        try {
            if (url.startsWith('data:image')) {
                const [header, base64] = url.split(',');
                const mimeType = header.split(';')[0].split(':')[1];
                return { base64, mimeType };
            }

            const response = await firstValueFrom(
                this.httpService.get(url, { responseType: 'arraybuffer' }),
            );
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            return { base64, mimeType: 'image/jpeg' };
        } catch (error) {
            console.error(`Base64 이미지 다운로드 실패: ${url}`);
            return { base64: '' };
        }
    }
}
