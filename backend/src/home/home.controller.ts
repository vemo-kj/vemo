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
    Req,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateMemosDto } from '../memos/dto/create-memos.dto';
import { CreateMemosForVideoResponseDto } from './dto/create-memos-for-video-response.dto';
import { RequestWithUserInterface } from '../auth/interface/request-with-user.interface';
import { HomeResponseDto } from './dto/home-response.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    /**
     * 특정 비디오에 메모를 작성.
     * @param videoId 비디오 ID
     * @param req
     * @param createMemosDto 메모 작성 DTO
     * @returns 생성된 비디오와 메모 정보
     */
    @Post('video/:videoId/memos')
    @HttpCode(HttpStatus.CREATED)
    async createMemoForVideo(
        @Param('videoId') videoId: string,
        @Req() req: RequestWithUserInterface,
        @Body() createMemosDto: CreateMemosDto,
    ): Promise<CreateMemosForVideoResponseDto> {
        const userId = req.user.id;
        const createMemosResponseDto = await this.homeService.createMemosForVideo(
            videoId,
            createMemosDto,
            userId,
        );
        if (!createMemosResponseDto) {
            throw new NotFoundException(`Video with ID ${videoId} not found`);
        }
        return createMemosResponseDto;
    }

    //
    // /**
    //  * 플레이리스트 및 메모 생성 후 첫번째 비디오 반환
    //  * @param videoIds 비디오 ID 배열
    //  * @param createMemosDto 메모 작성 DTO
    //  * @returns CreateMemoForVideoResponseDto
    //  */
    // @Post('playlist')
    // @HttpCode(HttpStatus.CREATED)
    // async createPlaylistWithMemos(
    //     @Param('videoId') videoIds: string[],
    //     @Body() createMemosDto: CreateMemosDto,
    // ): Promise<CreateMemosForVideoResponseDto> {
    //     const createMemosResponseDto = await this.homeService.createMemosForVideo(
    //         videoId,
    //         createMemosDto,
    //     );
    //     if (!createMemosResponseDto) {
    //         throw new NotFoundException(`Video with ID ${videoId} not found`);
    //     }
    //     return createMemosResponseDto;
    // }

    /**
     * 모든 비디오 카드를 조회
     * @param page 페이지 번호
     * @param limit 페이지당 비디오 수
     * @returns HomeResponseDto
     */
    @Public()
    @Get()
    async getAllVideos(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<HomeResponseDto> {
        return this.homeService.getAllVideos(page, limit);
    }
}
