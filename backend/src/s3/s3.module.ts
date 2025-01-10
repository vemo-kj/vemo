import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
@Module({
    providers: [
        {
            provide: 'S3',
            useFactory: (configService: ConfigService) => {
                return new S3({
                    region: configService.get<string>('AWS_REGION'),
                    accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
                    secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: ['S3'],
})
export class S3Module {}
