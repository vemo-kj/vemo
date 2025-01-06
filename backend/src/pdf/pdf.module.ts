import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { MemosModule } from 'src/memos/memos.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [MemosModule, HttpModule],
    controllers: [PdfController],
    providers: [PdfService],
})
export class PdfModule {}
