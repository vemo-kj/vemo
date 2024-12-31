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
import { VemoModule } from './vemo/vemo.module';
import { HomeModule } from './home/home.module';

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
        VemoModule,
        HomeModule,
        UsersModule,
        AuthModule,
        SubtitlesModule,
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
