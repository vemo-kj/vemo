import { Module } from '@nestjs/common';
import { MemosController } from './memos.controller';
import { MemosService } from './memos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memos } from './memos.entity';
import { Users } from '../users/users.entity';
import { Video } from '../video/video.entity';
import { Playlist } from '../playlist/entities/playlist.entity';
import { Memo } from '../memo/memo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Memos, Memo, Users, Playlist, Video])],
    controllers: [MemosController],
    providers: [MemosService],
    exports: [MemosService, TypeOrmModule],
})
export class MemosModule {}
