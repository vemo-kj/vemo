import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimestampModule } from './timestamp/timestamp.module';
import { TimestampList } from './timestamp/entity/timestamp_list.entity';
import { Timestamp } from './timestamp/entity/timestamp.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // ConfigService 전역 사용 가능
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DATABASE_HOST'),
                port: +configService.get<number>('DATABASE_PORT'),
                username: configService.get('DATABASE_USERNAME'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                entities: [TimestampList, Timestamp, File],
                synchronize: true,
                logging: true,
                logger: 'advanced-console',
            }),
        }),
        TimestampModule,
    ],
})
export class AppModule {}
