import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { VemoService } from './vemo.service';
import { CreateMemosDto } from '../memos/dto/create-memos.dto';
import { CreateMemosResponseDto } from './dto/create-memos-response.dto';
import { GetCommunityMemosDto } from './dto/get-community-memos.dto';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';

@Controller('vemo')
export class VemoController {
    constructor(private readonly vemoService: VemoService) {}

    /**
     * 특정 비디오에 메모를 작성합니다.
     * @param videoId 비디오 ID
     * @param createMemosDto 메모 작성 DTO
     * @returns CreateMemoResponseDto
     */
    @Post('video/:videoId/memos')
    @HttpCode(HttpStatus.CREATED)
    async createMemoForVideo(
        @Param('videoId') videoId: string,
        @Body() createMemosDto: CreateMemosDto,
    ): Promise<CreateMemosResponseDto> {
        const createMemosResponseDto = await this.vemoService.createMemosForVideo(
            videoId,
            createMemosDto,
        );
        if (!createMemosResponseDto) {
            throw new NotFoundException(`Video with ID ${videoId} not found`);
        }
        return createMemosResponseDto;
    }

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
}
