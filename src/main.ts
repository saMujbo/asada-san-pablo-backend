import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:5173',
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
  await app.listen(port);
  const serverUrl = await app.getUrl();

  Logger.log(`Servidor corriendo en ${serverUrl}`, 'Bootstrap');
  console.log(`Servidor corriendo en: ${serverUrl}`);
  console.log(`Swagger disponible en: ${serverUrl}/api`);
}
bootstrap();
