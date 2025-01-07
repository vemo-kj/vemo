import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

// @Injectable()
// export class RedisConfigService implements CacheOptionsFactory {
//     constructor(private configService: ConfigService) {}

    createCacheOptions(): CacheModuleOptions {
        return {
            store: redisStore,
            host: this.configService.get<string>('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get<string>('REDIS_PASSWORD'),
            ttl: 60 * 60 * 24,
        };
    }
}
