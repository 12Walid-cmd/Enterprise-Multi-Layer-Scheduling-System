import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // auto filter DTO without filed
      forbidNonWhitelisted: false,
      transform: true,        // auto transform
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
