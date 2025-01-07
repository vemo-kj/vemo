import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
    UseInterceptors,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelService } from '../channel/channel.service';
import { YoutubeApiInterceptor } from '../youtubeauth/youtube-api.interceptor';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';
import { Video } from './video.entity';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);
    private readonly redisClient: Redis;

    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private youtubeAuthService: YoutubeAuthService,
        private channelService: ChannelService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private configService: ConfigService,
    ) {
        this.redisClient = new Redis({
            host: this.configService.get<string>('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get<string>('REDIS_PASSWORD'),
        });
    }

    /**
     * 비디오 요청 시 카운트 증가 및 Sorted Set에 추가
     * @param videoId 비디오 ID
     */
    async incrementVideoRequestCount(videoId: string): Promise<void> {
        const sortedSetKey = 'video:requestCounts';
        try {
            // 현재 카운트 가져오기
            const count = await this.redisClient.zscore(sortedSetKey, videoId);
            const newCount = count ? parseInt(count) + 1 : 1;

            // Sorted Set에 추가 또는 업데이트
            await this.redisClient.zadd(sortedSetKey, newCount, videoId);
        } catch (error) {
            this.logger.error(`Failed to increment request count for videoId: ${videoId}`, error);
            throw new InternalServerErrorException('Failed to increment video request count');
        }
    }

    /**
     * 상위 N개의 요청된 비디오 ID 가져오기
     * @param top N
     * @returns 비디오 ID 배열
     */
    async getTopRequestedVideos(top: number): Promise<string[]> {
        const sortedSetKey = 'video:requestCounts';
        try {
            const topVideos = await this.redisClient.zrevrange(sortedSetKey, 0, top - 1);
            return topVideos;
        } catch (error) {
            this.logger.error('Failed to retrieve top requested videos', error);
            throw new InternalServerErrorException('Failed to retrieve top requested videos');
        }
    }

    /**
     * 상위 N개의 요청된 비디오를 캐시에 저장
     */
    @Cron(CronExpression.EVERY_HOUR)
    async cacheTopRequestedVideos() {
        const topVideos = await this.getTopRequestedVideos(10); // 상위 10개 비디오
        for (const videoId of topVideos) {
            await this.getVideoData(videoId); // 캐시에 저장
        }
    }

    /**
     * 비디오 데이터 가져오기 (캐시 우선)
     * @param videoId 비디오 ID
     * @returns 비디오 데이터
     */
    async getVideoData(videoId: string): Promise<any> {
        const cacheKey = `video:data:${videoId}`;
        let videoData = await this.cacheManager.get<any>(cacheKey);

        if (videoData) {
            return videoData;
        }

        // DB에서 비디오 링크 부분 가져오기
        const video = await this.findVideoInDatabase(videoId);

        if (video) {
            videoData = {
                id: video.id,
                title: video.title,
                thumbnails: video.thumbnails,
                duration: video.duration,
                category: video.category,
                channel: video.channel,
            };
            await this.cacheManager.set(cacheKey, videoData, 3600); // 1시간 TTL
            return videoData;
        }

        // DB에 비디오가 없으면 YouTube API를 통해 가져오기
        const fetchedVideoData = await this.fetchVideoFromYouTube(videoId);
        if (!fetchedVideoData) {
            throw new NotFoundException('Video not found');
        }

        // 비디오 데이터를 DB에 저장하고 캐시에 저장
        const savedVideo = await this.createAndSaveVideo(fetchedVideoData);
        videoData = {
            id: savedVideo.id,
            title: savedVideo.title,
            thumbnails: savedVideo.thumbnails,
            duration: savedVideo.duration,
            category: savedVideo.category,
            channel: savedVideo.channel,
        };
        await this.cacheManager.set(cacheKey, videoData, 3600); // 1시간 TTL

        return videoData;
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

    protected async createAndSaveVideo(videoData: any): Promise<Video> {
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
     * ISO 8601 기간 형식을 HH:MM:SS로 변환
     * @param duration ISO 8601 기간 문자열
     * @returns HH:MM:SS 형식의 문자열
     */
    parseDuration(duration: string): string {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) {
            return '00:00:00';
        }

        const hours = parseInt(match[1]?.replace('H', '') || '0', 10);
        const minutes = parseInt(match[2]?.replace('M', '') || '0', 10);
        const seconds = parseInt(match[3]?.replace('S', '') || '0', 10);

        const pad = (num: number) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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
        const videos = await Promise.all(videoIds.map(videoId => this.getVideoData(videoId)));

        if (videos.length !== videoIds.length) {
            const foundVideoIds = videos.map(video => video.id);
            const notFoundVideoIds = videoIds.filter(id => !foundVideoIds.includes(id));
            throw new NotFoundException(`Videos with IDs ${notFoundVideoIds.join(', ')} not found`);
        }
        return videos;
    }
}
