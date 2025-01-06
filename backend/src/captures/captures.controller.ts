// captures.controller.ts

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CapturesService } from './captures.service';
import { CreateCapturesDto } from './dto/create-capture.dto';
import { UpdateCapturesDto } from './dto/update-capture.dto';

@Controller('captures')
export class CapturesController {
    constructor(private readonly capturesService: CapturesService) {}

    @Post()
    async createCapture(@Body() createCaptureDto: CreateCapturesDto) {
        const timestamp = this.convertTimeStringToDate(createCaptureDto.timestamp);
        return await this.capturesService.createCapture({
            ...createCaptureDto,
            timestamp: timestamp.toTimeString().split(' ')[0],
        });
    }

    @Get()
    async getCaptures() {
        return await this.capturesService.getCaptures();
    }

    @Get(':id')
    async getCaptureById(@Param('id') id: number) {
        return await this.capturesService.getCaptureById(id);
    }

    @Put(':id')
    async updateCapture(@Param('id') id: number, @Body() updateCaptureDto: UpdateCapturesDto) {
        return await this.capturesService.updateCapture(id, updateCaptureDto);
    }

    @Delete(':id')
    async deleteCapture(@Param('id') id: number) {
        return await this.capturesService.deleteCapture(id);
    }
    // [수정]
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
