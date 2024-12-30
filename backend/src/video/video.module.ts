import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { Video } from './video.entity';
import { VideoService } from './video.service';
import { Playlist } from '../playlist/entities/playlist.entity';
import { Memos } from '../memos/memos.entity';
import { Channel } from 'node:diagnostics_channel';

@Module({
    imports: [TypeOrmModule.forFeature([Video, Channel, Memos, Playlist])],
    providers: [VideoService],
    controllers: [VideoController],
})
export class VideoModule {}
