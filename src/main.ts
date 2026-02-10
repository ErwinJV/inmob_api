import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: process.env.AUTHORIZED_FRONTEND_DOMAIN,
    credentials: true,
  });

  // app.useGloba
  // lPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
