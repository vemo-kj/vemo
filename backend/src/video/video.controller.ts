import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    Param,
    NotFoundException,
    Logger,
} from '@nestjs/common';

import { YoutubeAuthService } from 'src/youtubeauth/youtube-auth.service';
import { VideoService } from './video.service';

@Controller('videos')
export class VideoController {
    private readonly logger = new Logger(VideoController.name);

    constructor(
        private readonly videoService: VideoService,
        private readonly youtubeAuthService: YoutubeAuthService,
    ) {}

    /**
     * 특정 비디오 데이터 조회
     * @param videoId 비디오 ID
     * @returns 비디오 데이터
     */
    @Get(':videoId')
    async getVideo(@Param('videoId') videoId: string) {
        try {
            // 요청 카운트 증가
            await this.videoService.incrementVideoRequestCount(videoId);

            // 비디오 데이터 가져오기 (캐시 우선)
            const videoData = await this.videoService.getVideoData(videoId);
            return videoData;
        } catch (error) {
            this.logger.error(`Error fetching video with ID ${videoId}:`, error);
            throw error;
        }
    }

    /**
     * 모든 비디오 조회
     * @param page 페이지 번호
     * @param limit 페이지당 비디오 수
     * @returns Video[]
     */
    @Get()
    async getAllVideos(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        try {
            const videos = await this.videoService.getAllVideos(page, limit);
            return videos;
        } catch (error) {
            this.logger.error('Error fetching all videos:', error);
            throw new InternalServerErrorException('Failed to fetch videos');
        }
    }
}
