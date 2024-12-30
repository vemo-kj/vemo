import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['http://localhost:3000', 'http://192.168.1.122:3000', 'http://192.168.1.158:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        // exposedHeaders: ['Content-Range', 'X-Total-Count'],
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 5050);
}

bootstrap();
