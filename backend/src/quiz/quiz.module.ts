import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { SubtitlesModule } from 'src/subtitles/subtitles.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        // TypeOrmModule.forFeature([Summaries, Summary]), // 엔티티 등록
        ConfigModule,
        SubtitlesModule,
    ],
    providers: [QuizService],
    controllers: [QuizController],
})
export class QuizModule {}
