import { Controller, Post, Query } from '@nestjs/common';
import { SubtitlesService } from 'src/subtitles/subtitles.service';
import { QuizService } from './quiz.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('quiz')
export class QuizController {
    constructor(
        private readonly subtitlesService: SubtitlesService,
        private readonly quizService: QuizService,
    ) {}

    @Public()
    @Post()
    async quizVideo(@Query('videoid') videoid: string) {
        if (!videoid) {
            throw new Error('Video ID is required'); // videoid가 없으면 에러 처리
        }

        const url = `https://www.youtube.com/watch?v=${videoid}`; // URL 생성
        try {
            const subtitles = await this.subtitlesService.getVideoSubtitles(url); // 자막 가져오기
            return this.quizService.extractQuiz(subtitles, videoid); // 퀴즈 생성
        } catch (error) {
            console.error('Error generating quiz:', error);
            throw new Error('Failed to generate quiz'); // 에러를 처리하고 적절한 메시지 반환
        }
    }   
    
}
