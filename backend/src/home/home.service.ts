import { Injectable, NotFoundException } from '@nestjs/common';
import { VideoService } from '../video/video.service';
import { MemosService } from '../memos/memos.service';
import { CreateMemosDto } from '../memos/dto/create-memos.dto';
import { HomeResponseDto } from './dto/home-response.dto';
import { VideoResponseDto } from '../video/dto/video-response.dto';
import { CreateMemosForVideoResponseDto } from './dto/create-memos-for-video-response.dto';

@Injectable()
export class HomeService {
    constructor(
        private readonly videoService: VideoService,
        private readonly memosService: MemosService,
    ) {}

    async createMemosForVideo(
        videoId: string,
        createMemosDto: CreateMemosDto,
        userId: number, // userId 추가
    ): Promise<CreateMemosForVideoResponseDto> {
        const video = await this.videoService.getVideoById(videoId);
        if (!video) {
            throw new NotFoundException(`Video with ID ${videoId} not found`);
        }

        const memos = await this.memosService.createMemos(createMemosDto, videoId, userId);

        return {
            video: {
                id: video.id,
                title: video.title,
                thumbnails: video.thumbnails,
                channel: {
                    id: video.channel.id,
                    thumbnails: video.channel.thumbnails,
                    title: video.channel.title,
                },
                duration: video.duration,
                category: video.category,
            },
            memos: {
                id: memos.id,
                title: memos.title,
                description: memos.description,
            },
        };
    }

    /**
     * 모든 비디오 데이터를 조회합니다.
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 비디오 수 (기본값: 10)
     * @returns HomeResponseDto
     */
    async getAllVideos(page: number = 1, limit: number = 10): Promise<HomeResponseDto> {
        const videos = await this.videoService.getAllVideos(page, limit);

        if (!videos.length) {
            throw new NotFoundException('비디오가 존재하지 않습니다.');
        }

        // 각 비디오에 대해 메모 수를 계산
        const videoDtos: VideoResponseDto[] = await Promise.all(
            videos.map(async video => {
                const vemoCount = await this.memosService.getVemoCountByVideo(video.id);
                return {
                    id: video.id,
                    title: video.title,
                    thumbnails: video.thumbnails,
                    duration: video.duration,
                    category: video.category,
                    channel: {
                        id: video.channel.id,
                        thumbnails: video.channel.thumbnails,
                        title: video.channel.title,
                    },
                    vemoCount,
                };
            }),
        );

        return { videos: videoDtos };
    }
}
