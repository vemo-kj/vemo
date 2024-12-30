import { Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { YoutubeauthService } from 'src/youtubeauth/youtubeauth.service';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
        private readonly youtubeauthService: YoutubeauthService,
    ) {}
    @Get('getChannel')
    async getChannel(@Query('channelId') channelId: string) {
        if (!this.youtubeauthService.isAuthenticated()) {
            return { error: 'Not authenticated' };
        }

        try {
            const channel = await this.channelService.getChannel(channelId);
            return { channel };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get channel');
        }
    }
}
