import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { YoutubeauthService } from 'src/youtubeauth/youtubeauth.service';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        private youtubeauthService: YoutubeauthService,
    ) {}

    async getChannel(channelId: string): Promise<Channel> {
        await this.youtubeauthService.ensureAuthenticated();

        const existingChannel = await this.channelRepository.findOne({ where: { id: channelId } });
        if (existingChannel) {
            return existingChannel;
        }

        const response = await this.youtubeauthService.youtube.channels.list({
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
