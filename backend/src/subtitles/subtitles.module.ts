import { Module } from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';

@Module({
    providers: [SubtitlesService],
})
export class SubtitlesModule {}
