import { webcrypto } from 'crypto';
// @ts-ignore
globalThis.crypto = webcrypto;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

/** Orígenes permitidos para CORS. Override con CORS_ORIGINS en .env (coma-separado). */
function getCorsOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
  if (fromEnv?.length) {
    return fromEnv;
  }
  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://redsanpbalo-frontend-abonados.vercel.app',
    'https://asadasansanpablo-frontend-aiqkne-5d927c-2-24-196-166.traefik.me'
  ];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
    },
  });

  //Para configurar el Swagger 
  const config = new DocumentBuilder()
    .setTitle('Documentación API')
    .setDescription('Swagger generado automáticamente con NestJS')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,     // <- usa @Transform de los DTOs
      whitelist: true,     // <- elimina pdropiedades extra
      forbidNonWhitelisted: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  const localUrl = `http://localhost:${port}`;
  const networkUrl = `http://2.24.196.166:${port}`;
  const publicUrl = process.env.APP_URL?.replace(/\/$/, '');

  Logger.log(`Servidor escuchando en 0.0.0.0:${port}`, 'Bootstrap');
  console.log(`Servidor escuchando en:   0.0.0.0:${port}`); 
  console.log(`Servidor local: ${localUrl}`);
  console.log(`Swagger local: ${localUrl}/api`);
  console.log(`Servidor en red: ${networkUrl}`);
  console.log(`Swagger en red: ${networkUrl}/api`);
  console.log(`Servidor publico: getCorsOrigins(): ${getCorsOrigins()}`);

  if (publicUrl) {
    console.log(`Servidor publico: ${publicUrl}`);
    console.log(`Swagger publico: ${publicUrl}/api`);
  }
}
bootstrap();
