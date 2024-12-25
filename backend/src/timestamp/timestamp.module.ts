import { Module } from '@nestjs/common';
import { TimestampController } from './timestamp.controller';
import { TimestampService } from './timestamp.service';
import { TimestampList } from './entity/timestamp_list.entity';
import { Timestamp } from './entity/timestamp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([TimestampList]), TypeOrmModule.forFeature([Timestamp])],
    controllers: [TimestampController],
    providers: [TimestampService],
})
export class TimestampModule {}
