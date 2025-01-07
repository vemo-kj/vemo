import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelModule } from 'src/channel/channel.module';
import { YoutubeAuthModule } from 'src/youtubeauth/youtube-auth.module';
import { VideoController } from './video.controller';
import { Video } from './video.entity';
import { VideoService } from './video.service';
import { VideoGateway } from './video.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Video]), YoutubeAuthModule, ChannelModule],
    providers: [VideoService, VideoGateway],
    controllers: [VideoController],
    exports: [VideoService, TypeOrmModule],
})
export class VideoModule {}
