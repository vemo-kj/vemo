import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeauthController } from './youtubeauth.controller';
import { YoutubeauthService } from './youtubeauth.service';

@Module({
    imports: [ConfigModule],
    providers: [YoutubeauthService],
    exports: [YoutubeauthService],
    controllers: [YoutubeauthController],
})
export class YoutubeauthModule {}
