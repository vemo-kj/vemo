import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { ChannelModule } from './channel/channel.module';
import { typeOrmConfig } from './config/typeorm.config';
import { MemosModule } from './memos/memos.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { UsersModule } from './users/users.module';
import { VideoModule } from './video/video.module';
import { YoutubeauthModule } from './youtubeauth/youtubeauth.module';
import { CapturesModule } from './captures/captures.module';

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

        MemosModule,
        VideoModule,
        ChannelModule,
        YoutubeauthModule,
        UsersModule,
        AuthModule,
        SubtitlesModule,
        CapturesModule,
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
