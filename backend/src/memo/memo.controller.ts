import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Controller('memo')
export class MemoController {
    constructor(private readonly memoService: MemoService) {}

    @Post()
    async createMemo(@Body() createMemoDto: CreateMemoDto) {
        return await this.memoService.createMemo(createMemoDto);
    }

    @Put(':id')
    async updateMemo(@Body() updateMemoDto: UpdateMemoDto) {
        return await this.memoService.updateMemo(updateMemoDto);
    }

    @Delete(':id')
    async deleteMemo(@Param('id') id: number) {
        return await this.memoService.deleteMemo(id);
    }
}
