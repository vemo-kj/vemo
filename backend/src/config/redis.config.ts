import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory {
    constructor(private configService: ConfigService) {}

    createCacheOptions(): CacheModuleOptions {
        return {
            store: redisStore,
            socket: {
                host: this.configService.get<string>('REDIS_HOST', 'localhost'),
                port: this.configService.get<number>('REDIS_PORT', 6379),
                password: this.configService.get<string>('REDIS_PASSWORD'),
            },
            ttl: 60 * 60 * 24,
        };
    }
}
