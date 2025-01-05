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
    ) {}

    @Public()
    @Get('download/:memosId')
    async downloadPDF(@Param('memosId') memosId: number, @Res() res: Response) {
        // 실제 데이터 조회

        const memos = await this.memosService.getMemosById(memosId);
        const { title, memo, capture } = memos;

        const pdfBuffer = await this.pdfService.createMemoCapturePDF(title, memo, capture);

        console.log(pdfBuffer);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=memo_timeline.pdf',
        });

        res.send(pdfBuffer);
    }
}
