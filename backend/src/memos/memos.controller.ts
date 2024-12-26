import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MemosService } from './memos.service';
import { Memos } from './memos.entity';
import { CreateMemosDto } from './dto/create-memos.dto';
import { UpdateMemosDto } from './dto/update-memos.dto';

@Controller('memos')
export class MemosController {
    constructor(private readonly memosService: MemosService) {}

    @Post()
    async createMemo(@Body() createMemoDto: CreateMemosDto): Promise<Memos> {
        return this.memosService.createMemo(createMemoDto);
    }

    @Get()
    async getAllMemosByVideo(): Promise<Memos[]> {
        return this.memosService.getAllMemosByVideo();
    }

    @Get('/:id')
    async getMemoById(@Param('id') id: number): Promise<Memos> {
        return this.memosService.getMemoById(id);
    }

    @Put('/:id')
    async updateMemo(@Param('id') id: number, @Body() updateMemoDto: UpdateMemosDto) {
        return this.memosService.updateMemo(id, updateMemoDto);
    }

    @Delete('/:id')
    async deleteMemo(@Param('id') id: number) {
        return this.memosService.deleteMemo(id);
    }
}
