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
import { CreateMemosResponseDto } from './dto/create-memos-response.dto';
import { Memos } from '../memos/memos.entity';

@Injectable()
export class HomeService {
    constructor(
        private readonly videoService: VideoService,
        private readonly memosService: MemosService,
        private readonly playlistService: PlaylistService,
    ) {}

    async createPlaylistWithMemos(
        userId: number,
        createPlaylistWithMemosDto: CreatePlaylistWithMemosDto,
    ): Promise<CreatePlaylistWithMemosResponseDto> {
        const { name, videoIds } = createPlaylistWithMemosDto;

        const playlist = await this.playlistService.createPlaylist({ name, videoIds }, userId);

        const firstVideoId = videoIds[0];
        await this.memosService.createMemos(name, '', firstVideoId, userId);

        return {
            playlist: playlist.id,
            videoId: firstVideoId,
        };
    }

    /**
     * 비디오에 대한 메모 생성 또는 최신 메모 조회
     * @param userId 사용자 ID
     * @param videoId 비디오 ID
     * @returns CreateMemosResponseDto
     */
    async createOrGetLatestMemos(userId: number, videoId: string): Promise<CreateMemosResponseDto> {
        // 사용자의 해당 비디오에 대한 메모 조회
        const userMemos = await this.memosService.getMemosByVideoAndUser(videoId, userId);

        // 메모가 없으면 새로 생성
        if (!userMemos || userMemos.length === 0) {
            const newMemos = await this.createInitialMemos(userId, videoId);
            return this.mapMemosToDto(newMemos);
        }

        // 메모가 있으면 가장 최신 메모와 내용을 함께 반환
        const latestMemos = userMemos[0]; // getMemosByVideoAndUser가 createdAt DESC로 정렬되어 있음
        const memosWithContent = await this.memosService.getMemosById(latestMemos.id);

        return this.mapMemosToDto(memosWithContent);
    }

    /**
     * 초기 메모 생성
     * @private
     * @param userId 사용자 ID
     * @param videoId 비디오 ID
     * @returns Memos
     */
    private async createInitialMemos(userId: number, videoId: string): Promise<Memos> {
        const video = await this.videoService.getVideoById(videoId);
        return await this.memosService.createMemos(video.title, '내용없음', videoId, userId);
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
            description: memos.description,
            createdAt: memos.createdAt,
            updatedAt: memos.updatedAt,
        };
    }

    /**
     * 모든 비디오 데이터를 조회합니다.
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 비디오 수 (기본값: 10)
     * @returns HomeResponseDto
     */
    async getAllVideos(page: number = 1, limit: number = 8): Promise<HomeResponseDto> {
    async getAllVideos(page: number = 1, limit: number = 8): Promise<HomeResponseDto> {
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
