import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    UseGuards,
} from '@nestjs/common';
import { YoutubeAuthGuard } from 'src/youtubeauth/youtubeauth.guard';
import { YoutubeauthService } from 'src/youtubeauth/youtubeauth.service';
import { VideoService } from './video.service';
@Controller('video')
@UseGuards(YoutubeAuthGuard)
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

        if (!this.youtubeauthService.isAuthenticated()) {
            return { error: 'Not authenticated' };
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
