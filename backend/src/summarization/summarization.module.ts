import { Module } from '@nestjs/common';
import { SummarizationService } from './summarization.service';
import { SummarizationController } from './summarization.controller';
import { SubtitlesModule } from 'src/subtitles/subtitles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Summary } from './entity/summarization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Summary]), SubtitlesModule],
    providers: [SummarizationService],
    controllers: [SummarizationController],
})
export class SummarizationModule {}
