import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';
import { VideoUrlDto } from './dto/videoUrl.dto';
import { SubtitleResponse } from './interfaces/subtitle.interface';

@Controller('subtitles')
export class SubtitlesController {
    constructor(private readonly subtitlesService: SubtitlesService) {}

    @Get()
    async getSubtitles(@Query(ValidationPipe) videoUrlDto: VideoUrlDto): Promise<SubtitleResponse> {
        return this.subtitlesService.getVideoSubtitles(videoUrlDto.url);
    }
}
