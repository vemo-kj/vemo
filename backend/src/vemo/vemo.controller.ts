import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
} from '@nestjs/common';
import { VemoService } from './vemo.service';
import { CreateMemosDto } from '../memos/dto/create-memos.dto';
import { CreateMemosResponseDto } from './dto/create-memos-response.dto';

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
}
