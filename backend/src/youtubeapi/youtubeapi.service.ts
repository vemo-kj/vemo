import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google, youtube_v3 } from 'googleapis';
import { Video } from 'src/video/video.entity';

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

    async getVideo(videoId: string): Promise<Video> {
        const response = await this.youtube.videos.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: [videoId],
        });

        const videoData = response.data.items?.[0];
        if (!videoData) {
            throw new Error('Video not found');
        }

        const snippet = videoData.snippet || {};
        const contentDetails = videoData.contentDetails || {};

        return {
            id: videoData.id,
            title: snippet.title || '',
            thumbnails: snippet.thumbnails?.high?.url || '',
            duration: this.parseDuration(contentDetails.duration),
            category: snippet.categoryId || '',
            channel,
        };
    }

    private parseDuration(duration: string): string {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = match?.[1] ? parseInt(match[1]) : 0;
        const minutes = match?.[2] ? parseInt(match[2]) : 0;
        const seconds = match?.[3] ? parseInt(match[3]) : 0;
        return [hours, minutes, seconds].map(unit => unit.toString().padStart(2, '0')).join(':');
    }
}
