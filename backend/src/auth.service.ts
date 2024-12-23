import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class AuthService implements OnModuleInit {
    private readonly logger = new Logger(AuthService.name);
    private oauth2Client: OAuth2Client;
    private youtube;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

        this.logger.log(`Initializing OAuth2 client with redirect URI: ${redirectUri}`);
        this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }

    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtubepartner',
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
    }

    async getAccessToken(code: string) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            this.initializeYouTubeClient();
            return tokens;
        } catch (error) {
            this.logger.error('Failed to get access token:', error);
            throw error;
        }
    }

    private initializeYouTubeClient() {
        this.youtube = google.youtube({
            version: 'v3',
            auth: this.oauth2Client,
        });
    }

    async downloadCaptions(videoId: string, lang: string = 'ko') {
        try {
            if (!this.oauth2Client.credentials) {
                throw new Error('No credentials set - Please authenticate first');
            }

            // 1. 자막 목록 가져오기
            const captionsList = await this.youtube.captions.list({
                part: ['id', 'snippet'],
                videoId: videoId,
            });

            if (!captionsList.data.items) {
                throw new Error('No captions found');
            }

            // 2. 요청된 언어의 자막 찾기
            const caption = captionsList.data.items.find(c => c.snippet?.language === lang);

            if (!caption) {
                throw new Error(`No caption found for language: ${lang}`);
            }

            // 3. 자막 다운로드 - googleapis 라이브러리 사용
            const download = await this.youtube.captions.download({
                id: caption.id,
                tfmt: 'srt',
            });

            if (!download.data) {
                throw new Error('Failed to download caption content');
            }

            return {
                language: caption.snippet?.language,
                content: download.data,
            };
        } catch (error) {
            this.logger.error('Failed to download captions:', error?.response?.data || error);
            throw error;
        }
    }

    async getCaptions(videoId: string) {
        try {
            if (!this.oauth2Client.credentials) {
                throw new Error('No credentials set - Please authenticate first');
            }

            this.logger.log(`Getting captions for video: ${videoId}`);
            const response = await this.youtube.captions.list({
                part: ['id', 'snippet'],
                videoId: videoId,
            });
            return response.data;
        } catch (error) {
            this.logger.error('Failed to get captions:', error);
            throw error;
        }
    }

    isAuthenticated(): boolean {
        return !!this.oauth2Client?.credentials?.access_token;
    }
}
