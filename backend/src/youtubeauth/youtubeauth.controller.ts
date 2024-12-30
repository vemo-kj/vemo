import { Controller, Get, Query, Redirect, Session } from '@nestjs/common';
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
    @Redirect()
    async oauth2Callback(@Query('code') code: string, @Session() session: Record<string, any>) {
        const tokens = await this.youtubeauthService.getAccessToken(code);
        await this.youtubeauthService.setTokenForSession(session.id, tokens);

        const returnUrl = session.returnTo || '/';
        delete session.returnTo;

        return { url: returnUrl };
    }
}
