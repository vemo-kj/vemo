import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelService } from '../channel/channel.service';
import { YoutubeauthService } from '../youtubeauth/youtubeauth.service';
import { Video } from './video.entity';

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private youtubeauthService: YoutubeauthService,
        private channelService: ChannelService,
    ) {}

    async getVideoById(videoId: string): Promise<Video> {
        await this.youtubeauthService.ensureAuthenticated();

        const existingVideo = await this.videoRepository.findOne({
            where: { id: videoId },
            relations: ['channel'],
        });

        if (existingVideo) {
            return existingVideo;
        }

        const response = await this.youtubeauthService.youtube.videos.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: [videoId],
        });

        const videoData = response.data.items?.[0];
        if (!videoData) {
            throw new NotFoundException('Video not found');
        }

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

    /**
     * 모든 비디오 데이터를 조회합니다.
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 비디오 수 (기본값: 10)
     * @returns Video[]
     */
    async getAllVideos(page: number = 1, limit: number = 10): Promise<Video[]> {
        return this.videoRepository.find({
            relations: ['channel'],
            order: { id: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async getVideosByIds(videoIds: string[]): Promise<Video[]> {
        // const videos = await this.videoRepository.find({
        //     where: { id: In(videoIds) },
        //     relations: ['channel'],
        // });

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
