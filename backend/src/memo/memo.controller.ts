import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Controller('memo')
export class MemoController {
    constructor(private readonly memoService: MemoService) {}

    @Post()
    async createMemo(@Body() createMemoDto: CreateMemoDto) {
        return await this.memoService.create(createMemoDto);
    }

    @Get()
    async findAll() {
        return await this.memoService.findAll();
    }

    @Get('memosid')
    async findByMemosId(@Body('memosId') memosId: string) {
        return await this.memoService.findByMemosId(memosId);
    }

    @Put()
    async update(@Body() updateMemoDto: UpdateMemoDto) {
        return await this.memoService.update(updateMemoDto);
    }
}
