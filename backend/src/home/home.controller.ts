import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { RequestWithUserInterface } from '../auth/interface/request-with-user.interface';
import { Public } from '../public.decorator';
import { CreatePlaylistWithMemosResponseDto } from './dto/create-playlist-with-memos-response.dto';
import { CreatePlaylistWithMemosDto } from './dto/create-playlist-with-memos.dto';
import { HomeResponseDto } from './dto/home-response.dto';
import { HomeService } from './home.service';
import { CreateMemosResponseDto } from './dto/create-memos-response.dto';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    /**
     * 플레이리스트 생성 및 첫번째 비디오에 대한 메모 생성
     * @param createMemosDto 메모 작성 DTO
     * @param req
     * @returns CreatePlaylistWithMemosResponseDto
     */
    @Post('/memos')
    @HttpCode(HttpStatus.CREATED)
    async createPlaylistWithMemos(
        @Body() createMemosDto: CreatePlaylistWithMemosDto,
        @Req() req: RequestWithUserInterface,
    ): Promise<CreatePlaylistWithMemosResponseDto> {
        const userId = req.user.id;
        return await this.homeService.createPlaylistWithMemos(userId, createMemosDto);
    }

    /**
     * 비디오에 대한 메모 생성 또는 최신 메모 조회
     * @param videoId 비디오 ID
     * @param req
     * @returns CreateMemosResponseDto
     */
    @Post('/memos/:videoId')
    @HttpCode(HttpStatus.CREATED)
    async createOrGetLatestMemos(
        @Param('videoId') videoId: string,
        @Req() req: RequestWithUserInterface,
    ): Promise<CreateMemosResponseDto> {
        const userId = req.user.id;
        return await this.homeService.createOrGetLatestMemos(userId, videoId);
    }

    /**
     * 모든 비디오 카드를 조회
     * @param page 페이지 번호
     * @param limit 페이지당 비디오 수
     * @returns HomeResponseDto
     */
    @Public()
    @Get('/cards')
    async getAllVideos(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    ): Promise<HomeResponseDto> {
        return this.homeService.getAllVideos(page, limit);
    }
}
