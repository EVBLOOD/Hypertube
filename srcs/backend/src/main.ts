import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PipesConsumer } from '@nestjs/core/pipes';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });  
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
 
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();