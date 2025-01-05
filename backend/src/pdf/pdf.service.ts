import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
    async createMemoCapturePDF(title: string, memos: any[], capture: any[]): Promise<Buffer> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // HTML 템플릿 구성
        const htmlContent = this.generateHTML(title, memos, capture);

        // HTML 렌더링
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        // PDF 생성
        const pdfBuffer = Buffer.from(
            await page.pdf({
                format: 'A4',
                printBackground: true,
            }),
        );

        await browser.close();
        return pdfBuffer;
    }

    // HTML 템플릿 생성 함수
    private generateHTML(title: string, memos: any[], capture: any[]): string {
        return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Noto Sans KR', sans-serif;
                    margin: 40px;
                    line-height: 1.6;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .memo, .capture {
                    margin-bottom: 20px;
                }
                .timestamp {
                    font-size: 14px;
                    color: #555;
                }
                .description {
                    font-size: 16px;
                }
                .image {
                    text-align: center;
                    margin-top: 20px;
                }
                img {
                    width: 400px;
                    max-width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
            ${memos
                .map(
                    memo => `
                <div class="memo">
                    <div class="timestamp">[${this.formatTimestamp(memo.timestamp)}]</div>
                    <div class="description">${memo.description}</div>
                </div>
            `,
                )
                .join('')}
            
            ${capture
                .map(
                    item => `
                <div class="capture">
                    <div class="timestamp">${this.formatTimestamp(item.timestamp)}</div>
                    <div class="image">
                        <img src="${item.image}" alt="Captured Image" />
                    </div>
                </div>
            `,
                )
                .join('')}
        </body>
        </html>
        `;
    }

    // 타임스탬프 포맷팅 함수
    private formatTimestamp(timestamp: string): string {
        const date = new Date(timestamp);
        const minutes = String(date.getMinutes()).padStart(2, '0'); // 두 자리 분
        const seconds = String(date.getSeconds()).padStart(2, '0'); // 두 자리 초
        return `${minutes}:${seconds}`;
    }
}
