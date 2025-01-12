import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MemosService } from '../memos/memos.service';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { PlaylistService } from '../playlist/playlist.service';
import { MemosDto } from './dto/memos.dto';
import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';
import { CreatePlaylistDto } from '../playlist/dto/create-playlist.dto';
import { Playlist } from '../playlist/entities/playlist.entity';
import { Memos } from '../memos/memos.entity';
import { UsersService } from '../users/users.service';
import { CapturesService } from '../captures/captures.service';
import { MemoService } from '../memo/memo.service';

@Injectable()
export class VemoService {
    constructor(
        private readonly memosService: MemosService,
        private readonly playlistService: PlaylistService,
        private readonly usersService: UsersService,
        private readonly capturesService: CapturesService,
        private readonly memoService: MemoService,
    ) {}

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

    /**
     * 커뮤니티 메모 퍼가기
     * @param memosId
     * @param userId
     * @returns Memos
     */
    async scrapCommunityMemos(memosId: number, userId: number): Promise<Memos> {
        // 1. 기존 메모와 사용자 조회
        const memos = await this.memosService.getMemosById(memosId);
        if (!memos) {
            throw new NotFoundException('메모를 찾을 수 없습니다.');
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException('유저를 찾을 수 없습니다.');
        }

        // 2. 새로운 Memos 생성 (타이틀, 비디오, 사용자 지정)
        const newMemos = await this.memosService.createMemos(memos.title, memos.video.id, userId);

        // 3. 기존 메모의 Memo 복제 및 저장
        if (memos.memo && memos.memo.length > 0) {
            for (const oldMemo of memos.memo) {
                try {
                    await this.memoService.createMemo({
                        timestamp: oldMemo.timestamp,
                        description: oldMemo.description,
                        memosId: newMemos.id,
                    });
                } catch (error) {
                    throw new InternalServerErrorException('Memo 복제 중 오류 발생', {
                        cause: error,
                    });
                }
            }
        }

        // 4. 기존 메모의 Captures 복제 및 저장
        if (memos.captures && memos.captures.length > 0) {
            for (const oldCapture of memos.captures) {
                try {
                    await this.capturesService.createCapture({
                        timestamp: oldCapture.timestamp,
                        image: oldCapture.image,
                        memosId: newMemos.id,
                    });
                } catch (error) {
                    throw new InternalServerErrorException('Captures 복제 중 오류 발생', {
                        cause: error,
                    });
                }
            }
        }

        return newMemos;
    }
}
