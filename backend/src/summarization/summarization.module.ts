import { Module } from '@nestjs/common';
import { SummarizationService } from './summarization.service';
import { SummarizationController } from './summarization.controller';
import { SubtitlesModule } from 'src/subtitles/subtitles.module';

@Module({
    imports: [SubtitlesModule],
    providers: [SummarizationService],
    controllers: [SummarizationController],
})
export class SummarizationModule {}
