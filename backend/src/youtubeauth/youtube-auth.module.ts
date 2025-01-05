import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeAuthService } from './youtube-auth.service';

@Module({
    imports: [ConfigModule],
    providers: [YoutubeAuthService],
    exports: [YoutubeAuthService],
})
export class YoutubeAuthModule {}
