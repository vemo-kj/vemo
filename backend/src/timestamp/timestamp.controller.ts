import { Body, Controller, Get, Post } from '@nestjs/common';
import { TimestampService } from './timestamp.service';
import { CreateTimestampDto } from './dto/create-timestamp.dto';

@Controller('timestamp')
export class TimestampController {
    constructor(private readonly timestampService: TimestampService) {}

    @Post()
    async createTimestamp(@Body() createTimestampDto: CreateTimestampDto) {
        return await this.timestampService.createTimestamp(createTimestampDto);
    }
}
