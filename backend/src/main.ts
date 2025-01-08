import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    console.log('🚀 애플리케이션이 시작됩니다! 환경변수:', {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST,
    });
    app.enableCors({
        origin: [
            'http://vmemo.co.kr',
            process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    app.useGlobalGuards(new JwtAuthGuard(new Reflector()));

    if (process.env.NODE_ENV === 'development') {
        const config = new DocumentBuilder()
            .setTitle('VEMO API')
            .setDescription('VEMO 프로젝트 API 문서')
            .setVersion('1.0')
            .addTag('vemo')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document);
    }

    await app.listen(process.env.PORT ?? 5050);
}

bootstrap();
