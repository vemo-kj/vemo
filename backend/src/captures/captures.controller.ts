import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CapturesService } from './captures.service';
import { CreateCapturesDto } from './dto/create-capture.dto';
import { UpdateCapturesDto } from './dto/update-capture.dto';

@Controller('captures')
export class CapturesController {
    constructor(private readonly capturesService: CapturesService) {}

    @Post()
    async create(@Body() createCapturesDto: CreateCapturesDto) {
        return await this.capturesService.create(createCapturesDto);
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
    async update(@Param('id') id: number, @Body() updateCapturesDto: UpdateCapturesDto) {
        return await this.capturesService.update(id, updateCapturesDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        return await this.capturesService.delete(id);
    }
}
