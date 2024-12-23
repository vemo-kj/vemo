import { Controller, Get, Query, Redirect, Response } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';

@Controller()
export class AppController {
    constructor(private authService: AuthService) {}

    @Get('auth')
    @Redirect()
    redirectToAuth() {
        return { url: this.authService.getAuthUrl() };
    }

    @Get('oauth2callback')
    async oauth2callback(@Query('code') code: string) {
        const tokens = await this.authService.getAccessToken(code);
        return tokens;
    }

    @Get('download-captions')
    async downloadCaptions(
        @Query('videoId') videoId: string,
        @Query('lang') lang: string = 'ko',
        @Response() res: ExpressResponse,
    ) {
        const caption = await this.authService.downloadCaptions(videoId, lang);
        const fileName = `caption_${videoId}_${caption.language}.srt`;

        res.setHeader('Content-Type', 'text/srt');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.send(caption.content);
    }

    @Get('captions')
    async getCaptions(@Query('videoId') videoId: string) {
        if (!this.authService.isAuthenticated()) {
            throw new Error('Authentication required');
        }
        const captions = await this.authService.getCaptions(videoId);

        // 자막이 없는 경우 처리
        if (!captions || captions.length === 0) {
            throw new Error('No captions found for this video');
        }

        return captions;
    }
}
