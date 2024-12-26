import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Get('subtitles')
    async getSubtitles(@Query('videoid') videoid: string) {
        const url = `https://www.youtube.com/watch?v=${videoid}`;
        const subtitles = await this.summaryService.getVideoSubtitles(url);
        const summary = await this.summaryService.summarizeSubtitles(subtitles);
        return summary; // 자막과 요약본을 모두 반환
    }

    @Get('summarize')
    async summarize(@Query('videoid') text: string) {}
}
