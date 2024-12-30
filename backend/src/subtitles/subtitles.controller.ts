import { Controller, Get, Query } from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';

@Controller('subtitles')
export class SubtitlesController {
    constructor(private readonly subtitlesService: SubtitlesService) {}

    @Get()
    async getSubtitles(@Query('url') url: string) {
        return this.subtitlesService.getVideoSubtitles(url);
    }
}
