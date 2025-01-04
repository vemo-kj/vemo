import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { VemoService } from './vemo.service';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { RequestWithUserInterface } from '../auth/interface/request-with-user.interface';
import { Playlist } from '../playlist/entities/playlist.entity';

@Controller('vemo')
export class VemoController {
    constructor(private readonly vemoService: VemoService) {}

    /**
     * 커뮤니티 메모를 조회
     * @param videoId 비디오 ID
     * @param filter
     * @param req
     * @returns GetCommunityMemosResponseDto
     */
    @Get('video/:videoId/community')
    async getCommunityMemos(
        @Param('videoId') videoId: string,
        @Query('filter') filter: 'all' | 'mine' = 'all',
        @Req() req: RequestWithUserInterface,
    ): Promise<GetCommunityMemosResponseDto> {
        const userId = filter === 'mine' ? req.user.id : null;
        return await this.vemoService.getCommunityMemos(videoId, filter, userId);
    }

    /**
     * 사용자 재생목록 조회
     * @returns 사용자 재생목록 목록
     * @param playlistId
     */
    @Get('playlists/:playlistId')
    async getPlaylist(@Param('playlistId') playlistId: number): Promise<Playlist> {
        return await this.vemoService.getPlaylist(playlistId);
    }
}
