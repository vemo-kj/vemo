import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../video/video.entity';
import { Channel } from '../channel/channel.entity';
import { VideoModule } from 'src/video/video.module';
import { MemosService } from 'src/memos/memos.service';
import { MemosModule } from 'src/memos/memos.module';

@Module({
    imports: [TypeOrmModule.forFeature([Video, Channel]), VideoModule, MemosModule],
    controllers: [HomeController],
    providers: [HomeService, MemosService],
})
export class HomeModule {}
