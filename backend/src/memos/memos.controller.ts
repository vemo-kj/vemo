import { Body, Controller, Delete, Get, Param, Put, Query, Post } from '@nestjs/common';
import { MemosService } from './memos.service';
import { UpdateMemosDto } from './dto/update-memos.dto';
import { CreateMemosDto } from './dto/create-memos.dto';

@Controller('home/memos')
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
    async create(@Body() createMemosDto: CreateMemosDto) {
        console.log('Received request body:', createMemosDto);
        
        try {
            const result = await this.memosService.create(createMemosDto);
            console.log('Created memos:', result);
            return result;
        } catch (error) {
            console.error('Error creating memos:', error);
            throw error;
        }
    }
}
