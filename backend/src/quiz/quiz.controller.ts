import { Body, Controller, Post } from '@nestjs/common';
import { SubtitlesService } from 'src/subtitles/subtitles.service';
import { Public } from '../public.decorator';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
    constructor(
        private readonly subtitlesService: SubtitlesService,
        private readonly quizService: QuizService,
    ) {}

    @Public()
    @Post()
    async quizVideo(@Body() body: { videoId: string }) {
        const { videoId } = body;
        if (!videoId) {
            throw new Error('Video ID is required');
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`;
        try {
            const subtitles = await this.subtitlesService.getVideoSubtitles(url);
            return this.quizService.extractQuiz(subtitles, videoId);
        } catch (error) {
            console.error('Error generating quiz:', error);
            throw new Error('Failed to generate quiz');
        }
    }
}
