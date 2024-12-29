import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelModule } from 'src/channel/channel.module';
import { YoutubeauthModule } from 'src/youtubeauth/youtubeauth.module';
import { VideoController } from './video.controller';
import { Video } from './video.entity';
import { VideoService } from './video.service';
@Module({
    imports: [TypeOrmModule.forFeature([Video]), YoutubeauthModule, ChannelModule],
    providers: [VideoService],
    controllers: [VideoController],
})
export class VideoModule {}
