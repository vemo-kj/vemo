import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { YoutubeauthService } from './youtubeauth.service';

@Controller('youtubeauth')
export class YoutubeauthController {
    constructor(private readonly youtubeauthService: YoutubeauthService) {}

    @Get()
    @Redirect()
    redirectToAuth() {
        return { url: this.youtubeauthService.getAuthUrl() };
    }

    @Get('OAuth2Callback')
    @Redirect()
    async oauth2Callback(@Query('code') code: string) {
        const redirectUrl = await this.youtubeauthService.handleOAuthCallback(code);
        return { url: redirectUrl };
    }
}
