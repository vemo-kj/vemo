import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { YoutubeauthService } from './youtubeauth.service';

@Controller('youtubeauth')
export class YoutubeauthController {
    constructor(private readonly youtubeauthService: YoutubeauthService) {}
    @Get('auth')
    @Redirect()
    redirectToAuth() {
        return { url: this.youtubeauthService.getAuthUrl() };
    }

    @Get('OAuth2Callback')
    async oauth2Callback(@Query('code') code: string) {
        const tokens = await this.youtubeauthService.getAccessToken(code);
        return { tokens };
    }
}
