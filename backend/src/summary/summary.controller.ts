import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Get('subtitles')
    async getSubtitles(@Query('url') url: string) {
        const subtitles = await this.summaryService.getVideoSubtitles(url);
        const summary = await this.summaryService.summarizeSubtitles(subtitles);
        return summary; // 자막과 요약본을 모두 반환
    }
}
