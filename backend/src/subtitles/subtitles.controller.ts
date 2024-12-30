import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';
import { VideoUrlDto } from './dto/videoUrl.dto';
import { Subtitle } from './subtitle.interface';

@Controller('subtitles')
export class SubtitlesController {
    constructor(private readonly subtitlesService: SubtitlesService) {}

    @Get()
    async getSubtitles(@Query(ValidationPipe) videoUrlDto: VideoUrlDto): Promise<Subtitle[]> {
        return await this.subtitlesService.getVideoSubtitles(videoUrlDto.url);
    }
}
