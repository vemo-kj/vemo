import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        private youtubeAuthService: YoutubeAuthService,
    ) {
    }

    async getChannel(channelId: string): Promise<Channel> {
        await this.youtubeAuthService.ensureAuthenticated();

        const existingChannel = await this.channelRepository.findOne({ where: { id: channelId } });
        if (existingChannel) {
            return existingChannel;
        }

        const response = await this.youtubeAuthService.youtube.channels.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: [channelId],
        });

        const channelData = response.data.items?.[0];
        if (!channelData) {
            throw new Error('Channel not found');
        }

        const snippet = channelData.snippet || {};
        const thumbnailUrl =
            snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '';

        const channel = this.channelRepository.create({
            id: channelId,
            thumbnails: thumbnailUrl,
            title: snippet.title,
            videos: [],
        });

        return await this.channelRepository.save(channel);
    }
}
