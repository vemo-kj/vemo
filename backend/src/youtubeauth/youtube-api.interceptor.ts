import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { YoutubeAuthService } from './youtube-auth.service';

@Injectable()
export class YoutubeApiInterceptor implements NestInterceptor {
    constructor(private readonly youtubeAuthService: YoutubeAuthService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        return next.handle().pipe(
            catchError(async error => {
                if (error?.response?.status === 401) {
                    await this.youtubeAuthService.refreshAccessToken();
                    return next.handle();
                }
                throw error;
            }),
        );
    }
}
