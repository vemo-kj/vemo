import { Injectable, NotFoundException } from '@nestjs/common';
import { VideoService } from '../video/video.service';
import { MemosService } from '../memos/memos.service';
import { HomeResponseDto } from './dto/home-response.dto';
import { VideoResponseDto } from '../video/dto/video-response.dto';
import { CreatePlaylistWithMemosResponseDto } from './dto/create-playlist-with-memos-response.dto';
import { CreatePlaylistWithMemosDto } from './dto/create-playlist-with-memos.dto';
import { PlaylistService } from '../playlist/playlist.service';
import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';

const NO_CONTENTS = '제목없음';

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
        const playlist: PlaylistResponseDto = await this.playlistService.
        createPlaylist(
            createPlaylistWithMemosDto,
            userId,
        );
        //TODO: 데이터 확인 필요
        const video = playlist.videos[0];
        const memos = await this.memosService.createMemos(
            NO_CONTENTS,
            NO_CONTENTS,
            video.id,
            userId,
        );
        return {
            playlist: {
                id: playlist.id,
                name: playlist.name,
            },
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
