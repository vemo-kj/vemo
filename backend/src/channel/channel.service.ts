import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YoutubeApiInterceptor } from '../youtubeauth/youtube-api.interceptor';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        private youtubeAuthService: YoutubeAuthService,
    ) {}

    /**
     * 채널 정보를 조회하거나 없는 경우 생성
     * 사용하는 쪽에서는 채널의 존재 여부를 신경 쓸 필요 없이
     * 단순히 채널 ID만 제공하면 됨
     */
    @UseInterceptors(YoutubeApiInterceptor)
    async getChannel(channelId: string): Promise<Channel> {
        const existingChannel = await this.findChannelById(channelId);
        if (existingChannel) {
            return existingChannel;
        }

        return await this.createChannelFromYoutube(channelId);
    }

    private async findChannelById(channelId: string): Promise<Channel | null> {
        return await this.channelRepository.findOne({ where: { id: channelId } });
    }

    private async createChannelFromYoutube(channelId: string): Promise<Channel> {
        const channelData = await this.fetchChannelFromYoutube(channelId);
        return await this.saveChannel(channelData);
    }

    private async fetchChannelFromYoutube(channelId: string): Promise<any> {
        const response = await this.youtubeAuthService.youtube.channels.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: [channelId],
        });

        const channelData = response.data.items?.[0];
        if (!channelData) {
            throw new NotFoundException(`Channel with ID ${channelId} not found on YouTube`);
        }

        return channelData;
    }

    private async saveChannel(channelData: any): Promise<Channel> {
        const snippet = channelData.snippet || {};
        const thumbnailUrl =
            snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '';

        const channel = this.channelRepository.create({
            id: channelData.id,
            thumbnails: thumbnailUrl,
            title: snippet.title,
            videos: [],
        });

        return await this.channelRepository.save(channel);
    }
}
