import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Query,
} from '@nestjs/common';

import { YoutubeAuthService } from 'src/youtubeauth/youtube-auth.service';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
        private readonly youtubeAuthService: YoutubeAuthService,
    ) {}

    @Get('getVideo')
    async getVideo(@Query('videoId') videoId: string) {
        if (!videoId) {
            throw new BadRequestException('videoId is required');
        }

        try {
            const video = await this.videoService.getVideoById(videoId);
            return { video };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get video');
        }
    }
}
