import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeAuthModule } from '../youtubeauth/youtubeAuthModule';
import { ChannelController } from './channel.controller';
import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';

@Module({
    imports: [TypeOrmModule.forFeature([Channel]), YoutubeAuthModule],
    providers: [ChannelService],
    controllers: [ChannelController],
    exports: [ChannelService, TypeOrmModule],
})
export class ChannelModule {}
