import { Controller, Get, Query } from '@nestjs/common';
import { SubtitlesService } from 'src/subtitles/subtitles.service';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
    constructor(
        private readonly subtitlesService: SubtitlesService,
        private readonly quizService: QuizService,
    ) {}

    @Get()
    async quizVideo(@Query('videoid') videoid: string) {
        const url = `https://www.youtube.com/watch?v=${videoid}`;
        const subtitles = await this.subtitlesService.getVideoSubtitles(url);
        return this.quizService.extractQuiz(subtitles, videoid);
    }
}
