import { Controller, Get, InternalServerErrorException, Query, Redirect } from '@nestjs/common';
import { getChannelDto } from './\bdto/youtubeapi.getChannel.dto';
import { getVideoDto } from './\bdto/youtubeapi.getvideo.dto';
import { oauth2CallbackDto } from './\bdto/youtubeapi.oauth2callback.dto';
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
    async oauth2Callback(@Query('code') query: oauth2CallbackDto) {
        const tokens = await this.youtubeService.getAccessToken(query.code);
        return { tokens };
    }

    @Get('getVideo')
    async getVideo(@Query('videoId') query: getVideoDto) {
        if (!this.youtubeService.isAuthenticated()) {
            return { error: 'Not authenticated' };
        }

        try {
            const video = await this.youtubeService.getVideo(query.videoId);
            return { video };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get video');
        }
    }

    @Get('getChannel')
    async getChannel(@Query('channelId') query: getChannelDto) {
        if (!this.youtubeService.isAuthenticated()) {
            return { error: 'Not authenticated' };
        }

        try {
            const channel = await this.youtubeService.getChannel(query.channelId);
            return { channel };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get channel');
        }
    }
}
