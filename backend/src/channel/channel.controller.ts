import { Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { YoutubeAuthService } from 'src/youtubeauth/youtube-auth.service';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
        private readonly youtubeAuthService: YoutubeAuthService,
    ) {
    }

    @Get()
    async getChannel(@Query('channelId') channelId: string) {
        try {
            const channel = await this.channelService.getChannel(channelId);
            return { channel };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to get channel');
        }
    }
}
