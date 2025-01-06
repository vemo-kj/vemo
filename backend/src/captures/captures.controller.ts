import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CapturesService } from './captures.service';
import { CreateCapturesDto } from './dto/create-capture.dto';
import { UpdateCapturesDto } from './dto/update-capture.dto';

@Controller('captures')
export class CapturesController {
    constructor(private readonly capturesService: CapturesService) {}

    @Post()
    async createCapture(@Body() createCapturesDto: CreateCapturesDto) {
        return await this.capturesService.createCapture(createCapturesDto);
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
    async updateCapture(@Param('id') id: number, @Body() updateCapturesDto: UpdateCapturesDto) {
        return await this.capturesService.updateCapture(id, updateCapturesDto);
    }

    @Delete(':id')
    async deleteCapture(@Param('id') id: number) {
        return await this.capturesService.deleteCapture(id);
    }
}
