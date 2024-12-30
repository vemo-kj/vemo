import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SummaryModule } from './summary/summary.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { SummarizationModule } from './summarization/summarization.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        SummaryModule,
        SubtitlesModule,
        SummarizationModule,
        QuizModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
