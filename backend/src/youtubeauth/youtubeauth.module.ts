import { Module } from '@nestjs/common';
import { YoutubeauthService } from './youtubeauth.service';
import { YoutubeauthController } from './youtubeauth.controller';

@Module({
    providers: [YoutubeauthService],
    exports: [YoutubeauthService],
    controllers: [YoutubeauthController],
})
export class YoutubeauthModule {}
