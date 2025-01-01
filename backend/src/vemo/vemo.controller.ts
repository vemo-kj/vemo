import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { VemoService } from './vemo.service';
import { GetCommunityMemosDto } from './dto/get-community-memos.dto';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';
import { CreatePlaylistDto } from '../playlist/dto/create-playlist.dto';
import { RequestWithUserInterface } from '../auth/interface/request-with-user.interface';

@Controller('vemo')
export class VemoController {
    constructor(private readonly vemoService: VemoService) {}

    /**
     * 커뮤니티 메모를 조회
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
     * 사용자 재생목록 조회
     * @param userId 사용자 ID
     * @returns 사용자 재생목록 목록
     */
    @Get('playlists/:userId')
    async getUserPlaylists(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<PlaylistResponseDto[]> {
        return await this.vemoService.getUserPlaylists(userId);
    }

    /**
     * 사용자 재생목록 생성
     * @param createPlaylistDto 생성 DTO
     * @param req
     * @returns 생성된 재생목록 정보
     */
    @Post('playlist')
    async createUserPlaylist(
        @Body() createPlaylistDto: CreatePlaylistDto,
        @Req() req: RequestWithUserInterface,
    ): Promise<PlaylistResponseDto> {
        return await this.vemoService.createUserPlaylist(createPlaylistDto, req.user.id);
    }
}
