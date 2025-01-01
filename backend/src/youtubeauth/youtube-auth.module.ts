import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeAuthController } from './youtube-auth.controller';
import { YoutubeAuthService } from './youtube-auth.service';

@Module({
    imports: [ConfigModule],
    providers: [YoutubeAuthService],
    exports: [YoutubeAuthService],
    controllers: [YoutubeAuthController],
})
export class YoutubeAuthModule {}
