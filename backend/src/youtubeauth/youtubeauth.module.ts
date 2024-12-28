import { Module } from '@nestjs/common';
import { YoutubeauthService } from './youtubeauth.service';

@Module({
    providers: [YoutubeauthService],
    exports: [YoutubeauthService],
})
export class YoutubeauthModule {}
