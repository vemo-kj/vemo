import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { YoutubeauthService } from './youtubeauth.service';

@Injectable()
export class YoutubeAuthGuard implements CanActivate {
    constructor(private youtubeauthService: YoutubeauthService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const sessionId = request.session.id;

        if (!this.youtubeauthService.isAuthenticatedForSession(sessionId)) {
            request.session.returnTo = request.originalUrl;
            throw new UnauthorizedException({
                message: 'YouTube 인증이 필요합니다',
                redirectUrl: '/youtubeauth/auth',
            });
        }

        return true;
    }
}
