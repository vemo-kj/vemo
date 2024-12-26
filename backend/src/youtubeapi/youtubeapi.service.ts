import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google, youtube_v3 } from 'googleapis';

@Injectable()
export class YoutubeapiService implements OnModuleInit {
    private readonly logger = new Logger(YoutubeapiService.name);
    private oauth2Client: OAuth2Client;
    private youtube: youtube_v3.Youtube;

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
        }) as youtube_v3.Youtube;
    }

    isAuthenticated(): boolean {
        return !!this.oauth2Client?.credentials?.access_token;
    }

    async getVideo(videoId: string): Promise<youtube_v3.Schema$Video> {
        const response = await this.youtube.videos.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: [videoId],
        });
        return response.data;
    }

    async getChannel(channelId: string): Promise<youtube_v3.Schema$Channel> {
        const response = await this.youtube.channels.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: [channelId],
        });
        return response.data;
    }
}