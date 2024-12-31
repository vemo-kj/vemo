import { Module } from '@nestjs/common';
import { VemoService } from './vemo.service';
import { VemoController } from './vemo.controller';
import { VideoModule } from '../video/video.module';
import { MemosModule } from '../memos/memos.module';
import { PlaylistModule } from '../playlist/playlist.module';
import { ChannelModule } from '../channel/channel.module';

@Module({
    imports: [VideoModule, ChannelModule, MemosModule, PlaylistModule],
    controllers: [VemoController],
    providers: [VemoService],
})
export class VemoModule {}
