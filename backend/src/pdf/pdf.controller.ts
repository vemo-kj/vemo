import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { MemosService } from 'src/memos/memos.service';
import { Response } from 'express'; // 추가
import { PdfService } from 'src/pdf/pdf.service';
import { Public } from 'src/public.decorator';

@Controller('pdf')
export class PdfController {
    constructor(
        private readonly memosService: MemosService,
        private readonly pdfService: PdfService,
    ) { }

    @Public()
    @Get('download/:memosId')
    async downloadPDF(@Param('memosId') memosId: number, @Res() res: Response) {
        // memosId에 맞춰 title,memo,capture DB에 추출
        const memos = await this.memosService.getMemosById(memosId);
        const { title, memo, capture } = memos;

        const pdfBuffer = await this.pdfService.createMemoCapturePDF(title, memo, capture);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${title}_vemo.pdf`,
        });

        res.send(pdfBuffer);
    }
}
