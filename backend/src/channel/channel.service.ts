import { Injectable, NotFoundException } from '@nestjs/common';
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
    ) {}

    /**
     * 채널 정보를 조회하거나 없는 경우 생성
     */
    async getChannel(channelId: string): Promise<Channel> {
        const existingChannel = await this.findChannelById(channelId);
        if (existingChannel) {
            return existingChannel;
        }

        const channelData = await this.fetchChannelFromYoutube(channelId);
        return await this.createChannel(channelData);
    }

    /**
     * DB에서 채널 정보 조회
     */
    private async findChannelById(channelId: string): Promise<Channel | null> {
        return await this.channelRepository.findOne({ where: { id: channelId } });
    }

    /**
     * YouTube API에서 채널 정보 조회
     */
    private async fetchChannelFromYoutube(channelId: string): Promise<any> {
        await this.youtubeAuthService.ensureAuthenticated();

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

    /**
     * 채널 정보를 DB에 생성
     */
    private async createChannel(channelData: any): Promise<Channel> {
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
