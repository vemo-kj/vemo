import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { CapturesModule } from './captures/captures.module';
import { ChannelModule } from './channel/channel.module';
import { typeOrmConfig } from './config/typeorm.config';
import { HomeModule } from './home/home.module';
import { MemoModule } from './memo/memo.module';
import { MemosModule } from './memos/memos.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { SummarizationModule } from './summarization/summarization.module';
import { TextExtractionModule } from './text-extraction/text-extraction.module';
import { UsersModule } from './users/users.module';
import { VemoModule } from './vemo/vemo.module';
import { VideoModule } from './video/video.module';
import { YoutubeAuthModule } from './youtubeauth/youtube-auth.module';
// import { RedisConfigService } from './config/redis.config';
// import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => typeOrmConfig(configService),
            inject: [ConfigService],
        }),
        // CacheModule.registerAsync({
        //     imports: [ConfigModule],
        //     useClass: RedisConfigService,
        //     isGlobal: true,
        // }),
        MemoModule,
        MemosModule,
        VideoModule,
        ChannelModule,
        YoutubeAuthModule,
        VemoModule,
        HomeModule,
        UsersModule,
        AuthModule,
        SubtitlesModule,
        PlaylistModule,
        QuizModule,
        CapturesModule,
        SummarizationModule,
        TextExtractionModule,
        PdfModule,
        MemoModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
