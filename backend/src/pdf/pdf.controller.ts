import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MemosService } from 'src/memos/memos.service';
import { PdfService } from 'src/pdf/pdf.service';
import { Public } from 'src/public.decorator';

@Controller('pdf')
export class PdfController {
    constructor(
        private readonly memosService: MemosService,
        private readonly pdfService: PdfService,
    ) {}

    @Public()
    @Get(':memosId')
    async downloadPdf(@Param('memosId', ParseIntPipe) memosId: number) {
        console.log('✨Hello');
        const memos = await this.memosService.getMemosById(memosId);
        console.log(memos);
        // PDF 생성 로직 추가
    }
}
