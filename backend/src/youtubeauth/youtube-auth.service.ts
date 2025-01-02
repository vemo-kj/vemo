import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google, youtube_v3 } from 'googleapis';

@Injectable()
export class YoutubeAuthService implements OnModuleInit {
    private readonly logger = new Logger(YoutubeAuthService.name);
    private oauth2Client: OAuth2Client;
    public youtube: youtube_v3.Youtube;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

        this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }

    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl',
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
    }

    async authenticateWithCode(code: string) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
        } catch (error) {
            this.logger.error('OAuth2.0 인증 실패:', error);
            throw new UnauthorizedException('YouTube OAuth2.0 인증에 실패했습니다');
        }
    }

    async ensureAuthenticated() {
        if (!this.isAuthenticated()) {
            throw new UnauthorizedException({
                code: 'YOUTUBE_AUTH_REQUIRED',
                message: 'YouTube OAuth2.0 인증이 필요합니다',
                redirectUrl: this.getAuthUrl(),
            });
        }
    }

    async handleOAuthCallback(code: string): Promise<string> {
        try {
            await this.authenticateWithCode(code);

            if (!this.isAuthenticated()) {
                throw new UnauthorizedException('YouTube 인증에 실패했습니다');
            }

            return 'http://localhost:3000'; // 성공 시 리다이렉트 URL
        } catch (error) {
            this.logger.error('OAuth 인증 에러:', error);
            return 'http://localhost:3000/error'; // 실패 시 리다이렉트 URL
        }
    }

    private isAuthenticated(): boolean {
        return !!this.oauth2Client?.credentials?.access_token;
    }

    async clearCredentials() {
        try {
            if (this.oauth2Client) {
                this.oauth2Client.credentials = null;
                this.youtube = null;
            }
        } catch (error) {
            this.logger.error('YouTube 인증 정보 제거 실패:', error);
            throw new InternalServerErrorException('YouTube 인증 정보 제거에 실패했습니다');
        }
    }
}
