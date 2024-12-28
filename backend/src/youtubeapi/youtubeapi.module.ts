import { Module } from '@nestjs/common';
import { YoutubeauthModule } from 'src/youtubeauth/youtubeauth.module';
import { YoutubeapiController } from './youtubeapi.controller';
import { YoutubeapiService } from './youtubeapi.service';

@Module({
    imports: [YoutubeauthModule],
    providers: [YoutubeapiService],
    controllers: [YoutubeapiController],
    exports: [YoutubeapiService],
})
export class YoutubeapiModule {}
