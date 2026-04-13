import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'https://redsanpbalo-frontend-abonados.vercel.app',
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

  if (publicUrl) {
    console.log(`Servidor publico: ${publicUrl}`);
    console.log(`Swagger publico: ${publicUrl}/api`);
  }
}
bootstrap();
