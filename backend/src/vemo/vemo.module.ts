import { Module } from '@nestjs/common';
import { VemoService } from './vemo.service';
import { VemoController } from './vemo.controller';
import { VideoModule } from '../video/video.module';
import { MemosModule } from '../memos/memos.module';
import { PlaylistModule } from '../playlist/playlist.module';
import { ChannelModule } from '../channel/channel.module';
import { UsersModule } from '../users/users.module';
import { MemoModule } from '../memo/memo.module';
import { CapturesModule } from '../captures/captures.module';

@Module({
    imports: [
        VideoModule,
        ChannelModule,
        UsersModule,
        MemosModule,
        MemoModule,
        CapturesModule,
        PlaylistModule,
    ],
    controllers: [VemoController],
    providers: [VemoService],
})
export class VemoModule {}
