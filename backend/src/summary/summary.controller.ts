import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Get('subtitles')
    async getSubtitles(@Query('url') url: string): Promise<any> {
        return this.summaryService.getVideoSubtitles(url);
    }
}
