import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { SubtitlesModule } from 'src/subtitles/subtitles.module';
import { ConfigModule } from '@nestjs/config';
import { Quiz } from './entity/quiz.entity';
import { Quizzes } from './entity/quizzes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([Quiz, Quizzes]), ConfigModule, SubtitlesModule],
    providers: [QuizService],
    controllers: [QuizController],
})
export class QuizModule {}
