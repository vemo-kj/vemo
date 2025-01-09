import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { VideoService } from '../video/video.service';
import { MemosService } from '../memos/memos.service';
import { HomeResponseDto } from './dto/home-response.dto';
import { VideoResponseDto } from '../video/dto/video-response.dto';
import { CreatePlaylistWithMemosResponseDto } from './dto/create-playlist-with-memos-response.dto';
import { CreatePlaylistWithMemosDto } from './dto/create-playlist-with-memos.dto';
import { PlaylistService } from '../playlist/playlist.service';
import { CreateMemosResponseDto } from './dto/create-memos-response.dto';
import { Memos } from '../memos/memos.entity';
import { Repository, EntityRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HomeService {
    constructor(
        private readonly videoService: VideoService,
        private readonly memosService: MemosService,
        private readonly playlistService: PlaylistService,
        @InjectRepository(Memos) private readonly memosRepository: Repository<Memos>,
    ) { }

    async createPlaylistWithMemos(
        userId: number,
        createPlaylistWithMemosDto: CreatePlaylistWithMemosDto,
    ): Promise<CreatePlaylistWithMemosResponseDto> {
        const { name, videoIds } = createPlaylistWithMemosDto;

        const playlist = await this.playlistService.createPlaylist({ name, videoIds }, userId);

        const firstVideo = await this.videoService.getVideoById(videoIds[0]);
        await this.memosService.createMemos(firstVideo.title, firstVideo.id, userId);

        return {
            playlistId: playlist.id,
            videoId: firstVideo.id,
        };
    }

    /**
     * 비디오에 대한 메모 생성 또는 최신 메모 조회
     * @param userId 사용자 ID
     * @param videoId 비디오 ID
     * @returns CreateMemosResponseDto
     */
    async createOrGetLatestMemos(userId: number, videoId: string): Promise<CreateMemosResponseDto> {
        try {
            // TypeORM을 사용한 쿼리
            const existingMemos = await this.memosRepository.find({
                where: { 
                    video: { id: videoId },
                    user: { id: userId }
                },
                relations: ['user', 'video'],
                order: { createdAt: 'DESC' },
                take: 1
            });

            // 쿼리 결과 로깅
            console.log('메모 조회 결과:', {
                userId,
                videoId,
                existingMemos
            });

            // 기존 메모가 있으면 반환
            if (existingMemos.length > 0) {
                return this.mapMemosToDto(existingMemos[0]);
            }

            // 기존 메모가 없으면 새로운 메모 생성
            const newMemo = await this.createInitialMemos(userId, videoId);
            
            return {
                id: newMemo.id,
                title: newMemo.title,
                createdAt: newMemo.createdAt,
                memo: [],      // 새로운 메모이므로 빈 배열
                captures: []   // 새로운 메모이므로 빈 배열
            };
            
        } catch (error) {
            console.error('메모 조회/생성 중 에러:', error);
            throw new InternalServerErrorException('Failed to create or get memos', {
                cause: error
            });
        }
    }

    /**
     * 초기 메모 생성
     * @private
     * @param userId 사용자 ID
     * @param videoId 비디오 ID
     * @returns Memos
     */
    private async createInitialMemos(userId: number, videoId: string): Promise<Memos> {
        try {
            const video = await this.videoService.getVideoById(videoId);
            return await this.memosService.createMemos(video.title, videoId, userId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create initial memos', {
                cause: error,
            });
        }
    }

    /**
     * Memos 엔티티를 DTO로 변환
     * @private
     * @param memos Memos 엔티티
     * @returns CreateMemosResponseDto
     */
    private mapMemosToDto(memos: Memos): CreateMemosResponseDto {
        return {
            id: memos.id,
            title: memos.title,
            createdAt: memos.createdAt,
            memo: Array.isArray(memos.memo) ? memos.memo.map(m => ({
                id: m.id,
                content: m.content,
                memosId: memos.id,
                timestamp: m.timestamp
            })) : [],
            captures: Array.isArray(memos.capture) ? memos.capture.map(c => ({
                id: c.id,
                imageUrl: c.imageUrl,
                memosId: memos.id,
                timestamp: c.timestamp
            })) : [],
        };
    }

    /**
     * 모든 비디오 데이터를 조회합니다.
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 비디오 수 (기본값: 10)
     * @returns HomeResponseDto
     */
    async getAllVideos(page: number = 1, limit: number = 100): Promise<HomeResponseDto> {
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
