import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistService } from './playlist.service';

@Module({
    imports: [TypeOrmModule.forFeature([Playlist])],
    providers: [PlaylistService],
    exports: [PlaylistService],
})
export class PlaylistModule {}
