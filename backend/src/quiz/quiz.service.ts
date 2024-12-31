import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizService {
    constructor(
        private readonly subtitlesService: SubtitlesService,
        private readonly summarizationService: SummarizationService,
    ) {}

    @Get()
    async summarizeVideo(@Query('videoid') videoid: string) {
        const url = `https://www.youtube.com/watch?v=${videoid}`;
        const subtitles = await this.subtitlesService.getVideoSubtitles(url);
        return this.summarizationService.extractSummary(subtitles, videoid);
    }
}
