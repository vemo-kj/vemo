import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dto/home-response.dto';
import { CreateMemosDto } from '../memos/dto/create-memos.dto';
import { CreateMemosForVideoResponseDto } from './dto/create-memos-for-video-response.dto';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    /**
     * 특정 비디오에 메모를 작성.
     * @param videoId 비디오 ID
     * @param createMemosDto 메모 작성 DTO
     * @returns CreateMemoForVideoResponseDto
     */
    @Post('video/:videoId/memos')
    @HttpCode(HttpStatus.CREATED)
    async createMemoForVideo(
        @Param('videoId') videoId: string,
        @Body() createMemosDto: CreateMemosDto,
    ): Promise<CreateMemosForVideoResponseDto> {
        const createMemosResponseDto = await this.homeService.createMemosForVideo(
            videoId,
            createMemosDto,
        );
        if (!createMemosResponseDto) {
            throw new NotFoundException(`Video with ID ${videoId} not found`);
        }
        return createMemosResponseDto;
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
