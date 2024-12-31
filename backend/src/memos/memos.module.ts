import { Module } from '@nestjs/common';
import { MemosController } from './memos.controller';
import { MemosService } from './memos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memos } from './memos.entity';
import { User } from '../users/users.entity';
import { Video } from '../video/video.entity';
import { Playlist } from '../playlist/entities/playlist.entity';
import { Memo } from '../memo/memo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Memos, Memo, User, Playlist, Video])],
    controllers: [MemosController],
    providers: [MemosService],
})
export class MemosModule {}
