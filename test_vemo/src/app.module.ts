import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Video } from './entities/video.entity';
import { Playlist } from './entities/playlist.entity';
import { Memo } from './entities/memo.entity';
import { TimestampList } from './entities/timestamp-list.entity';
import { Timestamp } from './entities/timestamp.entity';
import { SeedService } from './services/seed.service';
import { SeedController } from './controllers/seed.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, Video, Playlist, Memo, TimestampList, Timestamp],
        synchronize: true,
        logging: true,
        logger: 'advanced-console',
      }),
    }),
    TypeOrmModule.forFeature([User, Video, Playlist, Memo, TimestampList, Timestamp]),
  ],
  controllers: [SeedController, HealthController],
  providers: [SeedService],
})
export class AppModule {}
