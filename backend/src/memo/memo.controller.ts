import { Body, Controller, Delete, Logger, Param, Post, Put } from '@nestjs/common';
import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { MemosController } from '../memos/memos.controller';

@Controller('memo')
export class MemoController {
    private readonly logger = new Logger(MemosController.name);

    constructor(private readonly memoService: MemoService) {}
    // TODO: Memos ID가 필요한거 아닌가? @Post(':memosId')
    @Post()
    async createMemo(@Body() createMemoDto: CreateMemoDto) {
        this.logger.log('memo 생성(컨트롤러)');
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
