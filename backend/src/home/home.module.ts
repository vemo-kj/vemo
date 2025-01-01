import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../video/video.entity';
import { Channel } from '../channel/channel.entity';
import { VideoModule } from 'src/video/video.module';
import { MemosService } from 'src/memos/memos.service';
import { MemosModule } from 'src/memos/memos.module';
import { VideoService } from 'src/video/video.service';
import { PlaylistService } from 'src/playlist/playlist.service';
import { PlaylistModule } from 'src/playlist/playlist.module';

@Module({
    imports: [TypeOrmModule.forFeature([Video, Channel]), VideoModule, MemosModule, PlaylistModule],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule {}
