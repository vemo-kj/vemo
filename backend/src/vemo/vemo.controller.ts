import { Controller, Get, Param, Query } from '@nestjs/common';
import { VemoService } from './vemo.service';
import { GetCommunityMemosDto } from './dto/get-community-memos.dto';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { GetUserPlaylistsResponseDto } from './dto/get-user-playlists-response.dto';

@Controller('vemo')
export class VemoController {
    constructor(private readonly vemoService: VemoService) {}

    /**
     * 커뮤니티 메모를 조회합니다.
     * @param videoId 비디오 ID
     * @param getCommunityMemosDto 조회 옵션 DTO
     * @returns GetCommunityMemosResponseDto
     */
    @Get('video/:videoId/community')
    async getCommunityMemos(
        @Param('videoId') videoId: string,
        @Query() getCommunityMemosDto: GetCommunityMemosDto,
    ): Promise<GetCommunityMemosResponseDto> {
        return await this.vemoService.getCommunityMemos(videoId, getCommunityMemosDto);
    }

    /**
     * 사용자 재생목록을 조회합니다.
     * @param userId 사용자 ID
     * @returns 사용자 재생목록 목록
     */
    @Get('user/:userId/playlists')
    async getUserPlaylists(@Param('userId') userId: number): Promise<GetUserPlaylistsResponseDto> {
        const playlists = await this.vemoService.getUserPlaylists(userId);
        return { playlists };
    }
}
