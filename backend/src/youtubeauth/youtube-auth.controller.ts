import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { YoutubeAuthService } from './youtube-auth.service';

@Controller('youtubeauth')
export class YoutubeAuthController {
    constructor(private readonly youtubeAuthService: YoutubeAuthService) {}

    @Get()
    async redirectToAuth() {
        const url = this.youtubeAuthService.getAuthUrl();
        return { url };
    }

    @Public()
    @Get('OAuth2Callback')
    @Redirect()
    async oauth2Callback(@Query('code') code: string) {
        const redirectUrl = await this.youtubeAuthService.handleOAuthCallback(code);
        return { url: redirectUrl };
    }
}
