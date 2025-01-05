// memo.controller.ts

import { Body, Controller, Delete, Param, Post, Put, BadRequestException } from '@nestjs/common';
import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { CreateMemoData } from './interfaces/memo.interface';

@Controller('memo')
export class MemoController {
    constructor(private readonly memoService: MemoService) {}

    @Post()
    async createMemo(@Body() createMemoDto: CreateMemoDto) {
        try {
            const memoData: CreateMemoData = {
                ...createMemoDto,
                timestamp: this.convertTimeStringToDate(createMemoDto.timestamp),
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

    /**
     * MM:SS 또는 HH:MM:SS 형식의 문자열을 Date 객체로 변환
     * @param timeString - 변환할 시간 문자열 (예: "01:30" 또는 "01:30:00")
     * @returns Date 객체
     * @throws Error 잘못된 시간 형식일 경우
     */
    private convertTimeStringToDate(timeString: string): Date {
        // 시간 문자열 유효성 검사
        const isValidTimeFormat = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/.test(
            timeString,
        );
        if (!isValidTimeFormat) {
            throw new Error('Invalid time format. Use MM:SS or HH:MM:SS');
        }

        const parts = timeString.split(':').map(Number);
        const date = new Date();

        switch (parts.length) {
            case 2: // MM:SS
                date.setHours(0);
                date.setMinutes(parts[0]);
                date.setSeconds(parts[1]);
                break;
            case 3: // HH:MM:SS
                date.setHours(parts[0]);
                date.setMinutes(parts[1]);
                date.setSeconds(parts[2]);
                break;
            default:
                throw new Error('Invalid time format');
        }

        // 밀리초 초기화
        date.setMilliseconds(0);

        return date;
    }
}
