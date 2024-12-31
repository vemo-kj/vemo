import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapturesController } from './captures.controller';
import { Captures } from './captures.entity';
import { CapturesService } from './captures.service';

@Module({
    imports: [TypeOrmModule.forFeature([Captures])],
    providers: [CapturesService],
    controllers: [CapturesController],
})
export class CapturesModule {}
