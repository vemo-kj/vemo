import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { YoutubeauthService } from './youtubeauth.service';
@Controller('youtubeauth')
export class YoutubeauthController {
    constructor(private readonly youtubeauthService: YoutubeauthService) {}

    @Get()
    async redirectToAuth() {
        const url = this.youtubeauthService.getAuthUrl();
        return { url };
    }

    @Public()
    @Get('OAuth2Callback')
    @Redirect()
    async oauth2Callback(@Query('code') code: string) {
        const redirectUrl = await this.youtubeauthService.handleOAuthCallback(code);
        return { url: redirectUrl };
    }
}
