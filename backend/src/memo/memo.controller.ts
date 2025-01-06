import { BadRequestException, Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { CreateMemoData } from './interfaces/memo.interface';
import { convertTimeStringToDate } from '../common/utils/time.utils';

@Controller('memo')
export class MemoController {
    constructor(private readonly memoService: MemoService) {}

    @Post()
    async createMemo(@Body() createMemoDto: CreateMemoDto) {
        try {
            const memoData: CreateMemoData = {
                ...createMemoDto,
                timestamp: convertTimeStringToDate(createMemoDto.timestamp),
            };
            return await this.memoService.createMemo(memoData);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
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
