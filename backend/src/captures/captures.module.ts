import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapturesController } from './captures.controller';
import { Captures } from './captures.entity';
import { CapturesService } from './captures.service';
import { S3Module } from 'src/s3/s3.module';
import { MemosModule } from 'src/memos/memos.module';

@Module({
    imports: [TypeOrmModule.forFeature([Captures]), S3Module, MemosModule],
    providers: [CapturesService],
    controllers: [CapturesController],
    exports: [CapturesService],
})
export class CapturesModule {}
