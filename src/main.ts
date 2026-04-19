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

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();

// Exportación requerida por Vercel
export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule);

  // Misma configuración CORS que en bootstrap
  app.enableCors({
    // origin: process.env.AUTHORIZED_FRONTEND_DOMAIN,
    credentials: true,
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );

  await app.init();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = app.getHttpAdapter().getInstance();

  if (instance && typeof instance === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return instance(req, res);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return app.getHttpAdapter().getInstance()(req, res);
}
