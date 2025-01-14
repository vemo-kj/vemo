import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { MemosModule } from 'src/memos/memos.module';
import { HttpModule } from '@nestjs/axios';
import { S3Module } from 'src/s3/s3.module';
import { SummarizationModule } from 'src/summarization/summarization.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Summaries } from '../summarization/entity/summaries.entity';
import { Summary } from '../summarization/entity/summarization.entity';
import { AIUtils } from './pdf.utils';

@Module({
    imports: [
        MemosModule,
        HttpModule,
        S3Module,
        SummarizationModule,
        ConfigModule,
        TypeOrmModule.forFeature([Summaries, Summary]),
    ],
    controllers: [PdfController],
    providers: [AIUtils, PdfService],
})
export class PdfModule {}
