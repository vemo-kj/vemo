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

@Injectable()
export class HomeService {
    constructor(
        private readonly videoService: VideoService,
        private readonly memosService: MemosService,
        private readonly playlistService: PlaylistService,
    ) { }

    async createPlaylistWithMemos(
        userId: number,
        createPlaylistWithMemosDto: CreatePlaylistWithMemosDto,
    ): Promise<CreatePlaylistWithMemosResponseDto> {
        const { name, videoIds } = createPlaylistWithMemosDto;

        const playlist = await this.playlistService.createPlaylist({ name, videoIds }, userId);

        const firstVideo = await this.videoService.getVideoData(videoIds[0]);
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
            // 사용자의 해당 비디오에 대한 메모 조회
            const userMemos = await this.memosService.getMemosByVideoAndUser(videoId, userId);

            // 메모가 없으면 새로 생성
            if (!userMemos || userMemos.length === 0) {
                const newMemos = await this.createInitialMemos(userId, videoId);
                return this.mapMemosToDto(newMemos);
            }

            // 메모가 있으면 가장 최신 메모 반환
            return this.mapMemosToDto(userMemos[0]); // getMemosByVideoAndUser가 createdAt DESC로 정렬되어 있음
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create or get memos', {
                cause: error,
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
            const video = await this.videoService.getVideoData(videoId);
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
            return { videos: [] };
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
