import { Body, Controller, Delete, Param, Post, Put, BadRequestException } from '@nestjs/common';
import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Controller('memo')
export class MemoController {
    constructor(private readonly memoService: MemoService) {}

    @Post()
    async createMemo(@Body() createMemoDto: CreateMemoDto) {
        console.log('Received request body:', createMemoDto);
        try {
            // 문자열로 받은 타임스탬프를 Date 객체로 변환
            const timestamp = new Date(createMemoDto.timestamp);
            
            // 유효한 날짜인지 확인
            if (isNaN(timestamp.getTime())) {
                throw new BadRequestException('Invalid timestamp');
            }

            return await this.memoService.createMemo({
                ...createMemoDto,
                timestamp
            });
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
