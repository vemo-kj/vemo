import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { MemosModule } from './memos/memos.module';
import { YoutubeapiModule } from './youtubeapi/youtubeapi.module';
import { VideoModule } from './video/video.module';
import { ChannelModule } from './channel/channel.module';

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
        YoutubeapiModule,
        VideoModule,
        ChannelModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
