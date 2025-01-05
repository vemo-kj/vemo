import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import axios from 'axios';

@Injectable()
export class PdfService {
    async createMemoCapturePDF(title: string, memos: any[], capture: any[]): Promise<Buffer> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // HTML 템플릿 구성
        const htmlContent = await this.generateHTML(title, memos, capture);

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
    // HTML 템플릿 생성 함수
    private async generateHTML(title: string, memos: any[], capture: any[]): Promise<string> {
        const combined = [
            ...memos.map(memo => ({ ...memo, type: 'memo' })),
            ...capture.map(capture => ({ ...capture, type: 'capture' })),
        ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
  `;

        for (const item of combined) {
            const time = this.formatTimestamp(item.timestamp);

            if (item.type === 'memo') {
                htmlContent += `
          <div class="memo">
              <div class="timestamp">[${time}]</div>
              <div>${item.description}</div>
          </div>`;
            } else if (item.type === 'capture') {
                const base64Image = await this.fetchBase64FromUrl(item.image);
                if (base64Image) {
                    htmlContent += `
              <div class="capture">
                  <div class="timestamp">[${time}]</div>
                  <div class="image">
                      <img src="data:image/png;base64,${base64Image}" alt="Captured Image" />
                  </div>
              </div>`;
                } else {
                    htmlContent += `
              <div class="capture">
                  <div class="timestamp">[${time}]</div>
                  <div>이미지를 불러올 수 없습니다.</div>
              </div>`;
                }
            }
        }

        htmlContent += `</body></html>`;
        return htmlContent;
    }

    // 타임스탬프 포맷팅 함수
    private formatTimestamp(timestamp: string): string {
        const date = new Date(timestamp);
        const minutes = String(date.getMinutes()).padStart(2, '0'); // 두 자리 분
        const seconds = String(date.getSeconds()).padStart(2, '0'); // 두 자리 초
        return `${minutes}:${seconds}`;
    }

    private async fetchBase64FromUrl(url: string): Promise<string> {
        try {
            const response = await axios.get(url);
            return response.data.trim(); // base64 문자열 반환
        } catch (error) {
            console.error(`Base64 이미지 다운로드 실패: ${url}`);
            return ''; // 실패 시 빈 문자열 반환
        }
    }
}
