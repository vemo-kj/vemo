import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../video/video.entity';
import { Channel } from '../channel/channel.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Video, Channel])],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule {}
