import { Controller, Get, InternalServerErrorException, Query, Redirect } from '@nestjs/common';
import { YoutubeapiService } from './youtubeapi.service';

@Controller('youtubeapi')
export class YoutubeapiController {
    constructor(private readonly youtubeService: YoutubeapiService) {}

    @Get('auth')
    @Redirect()
    redirectToAuth() {
        return { url: this.youtubeService.getAuthUrl() };
    }

    @Get('OAuth2Callback')
    async oauth2Callback(@Query('code') code: string) {
        const tokens = await this.youtubeService.getAccessToken(code);
        return { tokens };
    }

    @Get('getVideo')
    async getVideo(@Query('videoId') videoId: string) {
        if (!this.youtubeService.isAuthenticated()) {
            return { error: 'Not authenticated' };
        }

        try {
            const video = await this.youtubeService.getVideo(videoId);
            return { video };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get video');
        }
    }

    @Get('getChannel')
    async getChannel(@Query('channelId') channelId: string) {
        if (!this.youtubeService.isAuthenticated()) {
            return { error: 'Not authenticated' };
        }

        try {
            const channel = await this.youtubeService.getChannel(channelId);
            return { channel };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get channel');
        }
    }
}
