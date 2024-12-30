import { Controller, Get, Query } from '@nestjs/common';
import { SubtitlesService } from 'src/subtitles/subtitles.service';
import { SummarizationService } from './summarization.service';

@Controller('summarization')
export class SummarizationController {
    constructor(
        private readonly subtitlesService: SubtitlesService,
        private readonly summarizationService: SummarizationService,
    ) {}

    @Get()
    async summarizeVideo(@Query('videoid') videoid: string) {
        const url = `https://www.youtube.com/watch?v=${videoid}`;
        const subtitles = await this.subtitlesService.getVideoSubtitles(url);
        return this.summarizationService.extractSummary(subtitles, videoid);
    }
}
