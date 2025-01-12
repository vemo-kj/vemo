import { Module } from '@nestjs/common';
import { SummarizationService } from './summarization.service';
import { SummarizationController } from './summarization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Summary } from './entity/summarization.entity';
import { ConfigModule } from '@nestjs/config';
import { Summaries } from './entity/summaries.entity';
import { SubtitlesModule } from 'src/subtitles/subtitles.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        TypeOrmModule.forFeature([Summaries, Summary]), // 엔티티 등록
        ConfigModule, // ConfigService 사용을 위해 필요
        SubtitlesModule,
        HttpModule,
    ],
    providers: [SummarizationService],
    controllers: [SummarizationController],
})
export class SummarizationModule {}
