import { Controller, Get } from '@nestjs/common';
import { TimestampService } from './timestamp.service';

@Controller('timestamp')
export class TimestampController {
    constructor(private readonly timestampService: TimestampService) {}

    @Get()
    getCurrentTimestamp() {
        return this.timestampService.getCurrentTimestamp();
    }
}
