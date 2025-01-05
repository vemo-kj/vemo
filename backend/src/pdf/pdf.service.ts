import { Injectable } from '@nestjs/common';
import axios from 'axios';
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
    async createMemoCapturePDF(title: string, memos: any[], capture: any[]): Promise<Buffer> {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));

        const combined = [
            ...memos.map(memo => ({ ...memo, type: 'memo' })),
            ...capture.map(capture => ({ ...capture, type: 'capture' })),
        ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        doc.fontSize(20).text(`${title}`, { align: 'center' });
        doc.moveDown();

        for (const item of combined) {
            const formattedTime = new Date(item.timestamp)
                .toISOString()
                .replace('T', ' ')
                .substring(0, 19);

            if (item.type === 'memo') {
                doc.fontSize(14).text(`📝 ${formattedTime}`);
                doc.fontSize(12).text(`${item.description}`);
                doc.moveDown();
            } else if (item.type === 'capture') {
                try {
                    const imageBuffer = await this.downloadImage(item.image);
                    doc.fontSize(14).text(`🖼️ ${formattedTime}`);
                    doc.image(imageBuffer, {
                        fit: [400, 400],
                        align: 'center',
                        valign: 'center',
                    });
                    doc.moveDown();
                } catch (error) {
                    console.error(`이미지 다운로드 실패: ${item.image}`);
                    doc.fontSize(12).text(`이미지를 불러오지 못했습니다.`);
                }
            }
        }

        return new Promise(resolve => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.end(); // 이 위치로 이동
        });
    }

    private async downloadImage(url: string): Promise<Buffer> {
        try {
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'arraybuffer',
            });
            return Buffer.from(response.data, 'binary');
        } catch (error) {
            console.error(`이미지 다운로드 실패: ${url}`);
            throw new Error('이미지 다운로드 실패');
        }
    }
}
