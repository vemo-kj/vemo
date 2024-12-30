import { Injectable, NotFoundException } from '@nestjs/common';
import { MemosService } from '../memos/memos.service';
import { Memos } from '../memos/memos.entity';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { GetCommunityMemosDto } from './dto/get-community-memos.dto';
import { Playlist } from '../playlist/entities/playlist.entity';
import { PlaylistService } from '../playlist/playlist.service';

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

        let memos: Memos[];

        if (filter === 'mine') {
            if (!userId) {
                throw new NotFoundException('User ID is required to filter my memos');
            }
            memos = await this.memosService.getAllMemosByVideo(videoId);
            memos = memos.filter(memo => memo.user.id === userId);
        } else {
            memos = await this.memosService.getAllMemosByVideo(videoId);
        }

        return { memos };
    }

    /**
     * 사용자 재생목록 조회
     * @param userId 사용자 ID
     * @returns 사용자 재생목록 목록
     */
    async getUserPlaylists(userId: number): Promise<Playlist[]> {
        return await this.playlistService.getPlaylistsByUser(userId);
    }
}
