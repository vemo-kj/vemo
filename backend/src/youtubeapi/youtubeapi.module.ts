import { Module } from '@nestjs/common';
import { YoutubeapiService } from './youtubeapi.service';
import { YoutubeapiController } from './youtubeapi.controller';

@Module({
    providers: [YoutubeapiService],
    controllers: [YoutubeapiController],
})
export class YoutubeapiModule {}
