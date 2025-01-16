import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
    UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelService } from '../channel/channel.service';
import { YoutubeApiInterceptor } from '../youtubeauth/youtube-api.interceptor';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';
import { Video } from './video.entity';

@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);

    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private youtubeAuthService: YoutubeAuthService,
        private channelService: ChannelService,
    ) {}

    async getVideoById(videoId: string): Promise<Video> {
        const existingVideo = await this.findVideoInDatabase(videoId);
        if (existingVideo) {
            return existingVideo;
        }

        const videoData = await this.fetchVideoFromYouTube(videoId);
        if (!videoData) {
            throw new NotFoundException('Video not found');
        }

        return await this.createAndSaveVideo(videoData);
    }

    async findVideoInDatabase(videoId: string): Promise<Video | null> {
        return await this.videoRepository.findOne({
            where: { id: videoId },
            relations: ['channel'],
        });
    }

    @UseInterceptors(YoutubeApiInterceptor)
    async fetchVideoFromYouTube(videoId: string): Promise<any> {
        try {
            const response = await this.youtubeAuthService.youtube.videos.list({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: [videoId],
            });

            return response.data.items?.[0] || null;
        } catch (error) {
            this.logger.error(`Failed to fetch video from YouTube for videoId: ${videoId}`, error);
            throw new UnauthorizedException('YouTube API 호출 실패');
        }
    }

    private async createAndSaveVideo(videoData: any): Promise<Video> {
        const snippet = videoData.snippet || {};
        const contentDetails = videoData.contentDetails || {};

        const channelId = snippet.channelId;
        if (!channelId) {
            throw new NotFoundException('Channel ID not found');
        }

        const channel = await this.channelService.getChannel(channelId);

        const video = this.videoRepository.create({
            id: videoData.id,
            title: snippet.title || '',
            thumbnails: snippet.thumbnails?.high?.url || '',
            duration: this.parseDuration(contentDetails.duration),
            category: snippet.categoryId || '',
            channel,
        });

        return await this.videoRepository.save(video);
    }

    async getAllVideos(page: number = 1, limit: number = 10): Promise<Video[]> {
        return this.videoRepository.find({
            relations: ['channel'],
            order: { id: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async getVideosByIds(videoIds: string[]): Promise<Video[]> {
        const videos = await Promise.all(videoIds.map(videoId => this.getVideoById(videoId)));
        if (videos.length !== videoIds.length) {
            const foundVideoIds = videos.map(video => video.id);
            const notFoundVideoIds = videoIds.filter(id => !foundVideoIds.includes(id));
            throw new NotFoundException(`Videos with IDs ${notFoundVideoIds.join(', ')} not found`);
        }
        return videos;
    }

    private parseDuration(duration: string): string {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = match?.[1] ? parseInt(match[1]) : 0;
        const minutes = match?.[2] ? parseInt(match[2]) : 0;
        const seconds = match?.[3] ? parseInt(match[3]) : 0;
        return [hours, minutes, seconds].map(unit => unit.toString().padStart(2, '0')).join(':');
    }
}
