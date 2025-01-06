import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { Repository } from 'typeorm';
import { PlaylistResponseDto } from './dto/playlist-response.dto';
import { UsersService } from '../users/users.service';
import { VideoService } from '../video/video.service';
import { Video } from '../video/video.entity';
import { CreatePlaylistWithMemosDto } from '../home/dto/create-playlist-with-memos.dto';

@Injectable()
export class PlaylistService {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
        private readonly usersService: UsersService,
        private readonly videoService: VideoService,
    ) {}

    /**
     * 재생목록 생성
     * @returns 생성된 재생목록 정보
     * @param createPlaylistWithMemosDto
     * @param userId
     */
    async createPlaylist(
        createPlaylistWithMemosDto: CreatePlaylistWithMemosDto,
        userId: number,
    ): Promise<PlaylistResponseDto> {
        const { name, videoIds } = createPlaylistWithMemosDto;

        // 사용자 존재 확인
        const user = await this.usersService.findById(userId);

        // 영상 존재 확인 및 가져오기
        const videos: Video[] = await this.videoService.getVideosByIds(videoIds);

        // 재생목록 생성
        const playlist = this.playlistRepository.create({
            name,
            user,
            videos,
        });

        await this.playlistRepository.save(playlist);

        // 재생목록 응답 DTO 생성
        return {
            id: playlist.id,
            name: playlist.name,
            userId: user.id,
            videos: videos.map(video => ({
                id: video.id,
                title: video.title,
                thumbnails: video.thumbnails,
                duration: video.duration,
                channel: {
                    id: video.channel.id,
                    title: video.channel.title,
                    thumbnails: video.channel.thumbnails,
                },
                category: video.category,
            })),
        };
    }

    /**
     * 플레이리스트 반환
     * @param playlistId
     * @return Playlist
     */
    async getPlaylist(playlistId: number): Promise<Playlist> {
        const playlist = await this.playlistRepository.findOne({
            where: { id: playlistId },
            relations: ['videos', 'user'], // 필요한 관계 데이터 포함
        });

        if (!playlist) {
            throw new NotFoundException(`Playlist with ID ${playlistId} not found`);
        }

        return playlist;
    }

    /**
     * 사용자별 재생목록 조회
     * @param userId 사용자 ID
     * @returns 사용자 재생목록 목록
     */
    async getPlaylistsByUser(userId: number): Promise<PlaylistResponseDto[]> {
        // 사용자 존재 확인
        const user = await this.usersService.findById(userId);

        // 사용자 재생목록 조회
        const playlists = await this.playlistRepository.find({
            where: { user: { id: userId } },
            relations: ['videos', 'videos.channel'],
        });

        // 재생목록 응답 DTO 변환
        return playlists.map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            userId: user.id,
            videos: playlist.videos.map(video => ({
                id: video.id,
                title: video.title,
                thumbnails: video.thumbnails,
                duration: video.duration,
                channel: {
                    id: video.channel.id,
                    title: video.channel.title,
                    thumbnails: video.channel.thumbnails,
                },
                category: video.category,
            })),
        }));
    }
}
