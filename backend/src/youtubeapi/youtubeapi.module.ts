import { Module } from '@nestjs/common';
import { YoutubeapiController } from './youtubeapi.controller';
import { YoutubeapiService } from './youtubeapi.service';

@Module({
    providers: [YoutubeapiService],
    controllers: [YoutubeapiController],
    exports: [YoutubeapiService],
})
export class YoutubeapiModule {}
