import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SummaryModule } from './summary/summary.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { SummarizationModule } from './summarization/summarization.module';
import { QuizModule } from './quiz/quiz.module';
=======
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChannelModule } from './channel/channel.module';
import { typeOrmConfig } from './config/typeorm.config';
import { MemosModule } from './memos/memos.module';
import { VideoModule } from './video/video.module';
import { YoutubeauthModule } from './youtubeauth/youtubeauth.module';
>>>>>>> a4e9f4cc03ba9c608d8065ea42c5aecfd11eaf9d

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
<<<<<<< HEAD
        }),
        SummaryModule,
        SubtitlesModule,
        SummarizationModule,
        QuizModule,
=======
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => typeOrmConfig(configService),
            inject: [ConfigService],
        }),

        MemosModule,
        VideoModule,
        ChannelModule,
        YoutubeauthModule,
>>>>>>> a4e9f4cc03ba9c608d8065ea42c5aecfd11eaf9d
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
