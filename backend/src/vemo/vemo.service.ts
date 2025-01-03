import { Injectable } from '@nestjs/common';
import { MemosService } from '../memos/memos.service';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { PlaylistService } from '../playlist/playlist.service';
import { MemosDto } from './dto/memos.dto';
import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';
import { CreatePlaylistDto } from '../playlist/dto/create-playlist.dto';
import { Playlist } from '../playlist/entities/playlist.entity';
import { Memos } from '../memos/memos.entity';

@Injectable()
export class VemoService {
    constructor(
        private readonly memosService: MemosService,
        private readonly playlistService: PlaylistService,
    ) { }

    /**
     * 커뮤니티 메모 조회
     * @param videoId 비디오 ID
     * @param filter 필터
     * @param userId 사용자 ID
     * @returns GetCommunityMemosResponseDto
     */
    async getCommunityMemos(
        videoId: string,
        filter: 'all' | 'mine',
        userId?: number,
    ): Promise<GetCommunityMemosResponseDto> {
        let memos: Memos[];

        if (filter === 'mine' && userId) {
            memos = await this.memosService.getMemosByVideoAndUser(videoId, userId);
        } else {
            memos = await this.memosService.getAllMemosByVideo(videoId);
        }

        const mappedMemos: MemosDto[] = memos.map(memo => ({
            id: memo.id,
            title: memo.title,
            user: {
                id: memo.user.id,
                nickname: memo.user.nickname,
            },
            created_at: memo.createdAt,
        }));

        return { memos: mappedMemos };
    }

    /**
     * 사용자 재생목록 조회
     * @param playlistId
     * @returns 사용자 재생목록 목록
     */
    async getPlaylist(playlistId: number): Promise<Playlist> {
        return await this.playlistService.getPlaylist(playlistId);
    }

    /**
     * 사용자 재생목록 생성
     * @param createPlaylistDto 생성 DTO
     * @param userId
     * @returns 생성된 재생목록 정보
     */
    async createUserPlaylist(
        createPlaylistDto: CreatePlaylistDto,
        userId: number,
    ): Promise<PlaylistResponseDto> {
        return await this.playlistService.createPlaylist(createPlaylistDto, userId);
    }
}
