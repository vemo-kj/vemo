import { Body, Controller, Delete, Get, Param, Put, Query, Post } from '@nestjs/common';
import { MemosService } from './memos.service';
import { UpdateMemosDto } from './dto/update-memos.dto';
import { CreateMemosDto } from './dto/create-memos.dto';

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
    async getMemosById(@Param('memosId') memosId: number) {
        return this.memosService.getMemosById(memosId);
    }

    @Put('/:id')
    async updateMemos(@Param('id') id: number, @Body() updateMemosDto: UpdateMemosDto) {
        return this.memosService.updateMemos(id, updateMemosDto);
    }

    @Delete('/:id')
    async deleteMemos(@Param('id') id: number) {
        return this.memosService.deleteMemos(id);
    }
    @Post()
    async createMemos(@Body() createMemosDto: CreateMemosDto) {
        // createMemosDto 구조: { title, description, videoId, userId } 가정
        const { title, description, videoId, userId } = createMemosDto;

        // memosService의 createMemos 호출
        const Memos = await this.memosService.createMemos(
            title,
            description,
            videoId,
            userId,
        );
        // 생성된 memos 엔티티(전체) 반환
        return Memos;
    }
}
