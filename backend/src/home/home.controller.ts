import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dto/home-response.dto';
import { RequestWithUserInterface } from '../auth/interface/request-with-user.interface';
import { CreatePlaylistWithMemosDto } from './dto/create-playlist-with-memos.dto';
import { CreatePlaylistWithMemosResponseDto } from './dto/create-playlist-with-memos-response.dto';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    /**
     * 플레이리스트 및 메모 생성 후 첫번째 비디오 반환
     * @param createMemosDto 메모 작성 DTO
     * @param req
     * @returns CreateMemoForVideoResponseDto
     */
    @Post('playlist')
    @HttpCode(HttpStatus.CREATED)
    async createPlaylistWithMemos(
        @Body() createMemosDto: CreatePlaylistWithMemosDto,
        @Req() req: RequestWithUserInterface,
    ): Promise<CreatePlaylistWithMemosResponseDto> {
        const userId = req.user.id;
        //TODO: 데이터 확인 필요

        return await this.homeService.createPlaylistWithMemos(userId, createMemosDto);
    }

    /**
     * 모든 비디오 카드를 조회
     * @param page 페이지 번호
     * @param limit 페이지당 비디오 수
     * @returns HomeResponseDto
     */
    @Get()
    async getAllVideos(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<HomeResponseDto> {
        return this.homeService.getAllVideos(page, limit);
    }
}
