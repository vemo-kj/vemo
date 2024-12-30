import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Query,
} from '@nestjs/common';

import { YoutubeauthService } from 'src/youtubeauth/youtubeauth.service';
import { VideoService } from './video.service';
@Controller('video')
export class VideoController {
    constructor(
        private readonly videoservice: VideoService,
        private readonly youtubeauthService: YoutubeauthService,
    ) {}

    @Get('getVideo')
    async getVideo(@Query('videoId') videoId: string) {
        if (!videoId) {
            throw new BadRequestException('videoId is required');
        }

        try {
            const video = await this.videoservice.getVideoById(videoId);
            return { video };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get video');
        }
    }
}
