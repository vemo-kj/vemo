import { Injectable, NotFoundException } from '@nestjs/common';
import { MemosService } from '../memos/memos.service';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { GetCommunityMemosDto } from './dto/get-community-memos.dto';
import { PlaylistService } from '../playlist/playlist.service';
import { MemosDto } from './dto/memos.dto';
import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';
import { CreatePlaylistDto } from '../playlist/dto/create-playlist.dto';

@Injectable()
export class VemoService {
    constructor(
        private readonly memosService: MemosService,
        private readonly playlistService: PlaylistService,
    ) {}

    /**
     * 커뮤니티 메모 조회
     * @param videoId 비디오 ID
     * @param getCommunityMemosDto 조회 옵션 DTO
     * @returns GetCommunityMemosResponseDto
     */
    async getCommunityMemos(
        videoId: string,
        getCommunityMemosDto: GetCommunityMemosDto,
    ): Promise<GetCommunityMemosResponseDto> {
        const { filter, userId } = getCommunityMemosDto;

        let memos = await this.memosService.getAllMemosByVideo(videoId);

        if (filter === 'mine') {
            if (!userId) {
                throw new NotFoundException('User ID is required to filter my memos');
            }
            memos = memos.filter(memo => memo.user.id === userId);
        }

        const mappedMemos: MemosDto[] = memos.map(memo => ({
            id: memo.id,
            title: memo.title,
            description: memo.description,
            user: {
                id: memo.user.id,
                nickname: memo.user.nickname,
            },
            created_at: memo.createdAt,
            updated_at: memo.updatedAt || memo.createdAt, // 수정되었다면 updatedAt 사용
        }));

        return { memos: mappedMemos };
    }

    /**
     * 사용자 재생목록 조회
     * @param userId 사용자 ID
     * @returns 사용자 재생목록 목록
     */
    async getUserPlaylists(userId: number): Promise<PlaylistResponseDto[]> {
        return await this.playlistService.getPlaylistsByUser(userId);
    }

    /**
     * 사용자 재생목록 생성
     * @param createPlaylistDto 생성 DTO
     * @returns 생성된 재생목록 정보
     */
    async createUserPlaylist(createPlaylistDto: CreatePlaylistDto): Promise<PlaylistResponseDto> {
        return await this.playlistService.createPlaylist(createPlaylistDto);
    }
}
