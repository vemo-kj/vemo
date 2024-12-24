import { Module } from '@nestjs/common';
import { TimestampController } from './timestamp.controller';
import { TimestampService } from './timestamp.service';

@Module({
    controllers: [TimestampController],
    providers: [TimestampService],
})
export class TimestampModule {}
