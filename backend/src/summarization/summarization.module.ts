import { Module } from '@nestjs/common';
import { SummarizationService } from './summarization.service';

@Module({
    providers: [SummarizationService],
})
export class SummarizationModule {}
