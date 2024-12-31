import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistService } from './playlist.service';
import { Video } from '../video/video.entity';
import { User } from '../users/users.entity';
import { UsersModule } from '../users/users.module';
import { VideoModule } from '../video/video.module';

@Module({
    imports: [TypeOrmModule.forFeature([Playlist, Video, User]), UsersModule, VideoModule],
    providers: [PlaylistService],
    exports: [PlaylistService],
})
export class PlaylistModule {}
