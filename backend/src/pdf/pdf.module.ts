import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { MemosModule } from 'src/memos/memos.module';

@Module({
    imports: [MemosModule],
    controllers: [PdfController],
    providers: [PdfService],
})
export class PdfModule {}
