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
        const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

        this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

        this.initializeYoutubeClient(refreshToken);
    }

    private async initializeYoutubeClient(refreshToken: string) {
        try {
            this.oauth2Client.setCredentials({ refresh_token: refreshToken });
            const { credentials } = await this.oauth2Client.refreshAccessToken();

            this.oauth2Client.setCredentials({
                access_token: credentials.access_token,
                refresh_token: refreshToken,
            });

            this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
            this.logger.log('YouTube 클라이언트 초기화 완료');
        } catch (error) {
            this.logger.error('YouTube 클라이언트 초기화 실패:', error);
            throw new InternalServerErrorException('YouTube API 초기화 실패');
        }
    }

    async refreshAccessToken() {
        try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            this.oauth2Client.setCredentials(credentials);
            this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
            return credentials.access_token;
        } catch (error) {
            this.logger.error('Access Token 갱신 실패:', error);
            throw new UnauthorizedException('YouTube API 토큰 갱신 실패');
        }
    }
}
