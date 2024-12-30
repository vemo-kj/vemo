import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { SubtitlesModule } from './subtitles/subtitles.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `${__dirname}/../../.env`,
        }),
        SubtitlesModule,
    ],

    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
