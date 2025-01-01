import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelModule } from 'src/channel/channel.module';
import { YoutubeAuthModule } from 'src/youtubeauth/youtubeAuthModule';
import { VideoController } from './video.controller';
import { Video } from './video.entity';
import { VideoService } from './video.service';

@Module({
    imports: [TypeOrmModule.forFeature([Video]), YoutubeAuthModule, ChannelModule],
    providers: [VideoService],
    controllers: [VideoController],
    exports: [VideoService, TypeOrmModule],
})
export class VideoModule {}
