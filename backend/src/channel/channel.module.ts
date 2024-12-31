import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeauthModule } from 'src/youtubeauth/youtubeauth.module';
import { ChannelController } from './channel.controller';
import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';

@Module({
    imports: [TypeOrmModule.forFeature([Channel]), YoutubeauthModule],
    providers: [ChannelService],
    controllers: [ChannelController],
    exports: [ChannelService],
})
export class ChannelModule {}
