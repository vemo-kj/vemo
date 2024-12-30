import { Module } from '@nestjs/common';
import { VemoService } from './vemo.service';
import { VemoController } from './vemo.controller';
import { VideoModule } from '../video/video.module';
import { MemosModule } from '../memos/memos.module';

@Module({
    imports: [VideoModule, MemosModule],
    controllers: [VemoController],
    providers: [VemoService],
})
export class VemoModule {}
