import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Put,
    Query,
} from '@nestjs/common';
import { UpdateMemosDto } from './dto/update-memos.dto';
import { MemosService } from './memos.service';
// import { GetMemosResponseDto } from './dto/get-memos-response.dto';
import { GetMemosResponseDto } from './dto/get-memos-response.dto';

@Controller('memos')
export class MemosController {
    constructor(private readonly memosService: MemosService) {}

    @Get()
    async getAllMemosByUser(@Query('userId') userId: number) {
        return this.memosService.getAllMemosByUser(userId);
    }

    @Get('/video/:videoId')
    async getAllMemosByVideo(@Param('videoId') videoId: string) {
        return this.memosService.getAllMemosByVideo(videoId);
    }

    @Get('/:memosId')
    async getMemosById(@Param('memosId') memosId: number): Promise<GetMemosResponseDto> {
        const memos = await this.memosService.getMemosById(memosId);

        if (!memos) {
            throw new NotFoundException('메모를 찾을 수 없습니다.');
        }

        return {
            id: memos.id,
            title: memos.title,
            createdAt: memos.createdAt,
            memo: memos.memo,
            captures: memos.capture,
        };
    }

    @Put('/:id')
    async updateMemos(@Param('id') id: number, @Body() updateMemosDto: UpdateMemosDto) {
        return this.memosService.updateMemos(id, updateMemosDto);
    }

    @Delete('/:id')
    async deleteMemos(@Param('id') id: number) {
        return this.memosService.deleteMemos(id);
    }
}
