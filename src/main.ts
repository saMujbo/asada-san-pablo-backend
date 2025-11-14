import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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
      whitelist: true,     // <- elimina propiedades extra
      forbidNonWhitelisted: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
