import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import * as bodyParser from 'body-parser'; // [추가]


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // [추가] request body 용량 제한 확대
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

    console.log('🚀 애플리케이션이 시작됩니다! 환경변수:', {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST,
    });
    app.enableCors({
        origin: 'http://localhost:3000',
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

    const config = new DocumentBuilder()
        .setTitle('VEMO API')
        .setDescription('VEMO 프로젝트 API 문서')
        .setVersion('1.0')
        .addTag('vemo')
        .build();

    app.useGlobalGuards(new JwtAuthGuard(new Reflector()));

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 5050);
}

bootstrap();
