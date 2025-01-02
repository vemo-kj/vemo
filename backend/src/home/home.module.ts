import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemosModule } from 'src/memos/memos.module';
import { PlaylistModule } from 'src/playlist/playlist.module';
import { VideoModule } from 'src/video/video.module';
import { Channel } from '../channel/channel.entity';
import { Video } from '../video/video.entity';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
    imports: [TypeOrmModule.forFeature([Video, Channel]), VideoModule, MemosModule, PlaylistModule],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule {}
