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
  try {
    console.log('🚀 Iniciando handler de Vercel...');

    const app = await NestFactory.create(AppModule);
    console.log('✅ App creada correctamente');

    app.enableCors({
      credentials: true,
    });

    await app.init();
    console.log('✅ App inicializada');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const instance = app.getHttpAdapter().getInstance();

    if (instance && typeof instance === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return instance(req, res);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return app.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    console.error('❌ Error en handler:', error);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    res.status(500).json({
      error: 'Internal Server Error',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: (error as Error).message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      stack:
        process.env.NODE_ENV === 'development'
          ? (error as Error)?.stack
          : undefined,
    });
  }
}
