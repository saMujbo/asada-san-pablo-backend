// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { MailServiceModule } from './mail-service/mail-service.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { CacheModule } from '@nestjs/cache-manager';
import { MaterialModule } from './material/material.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,                  // disponible en toda la app
      load: [configuration],           // mapea tus vars a un objeto
      envFilePath: ['.env'],           // ruta(s) del .env
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'JosDani_1007',
      database: 'redsanpablotest',
      autoLoadEntities: true,
      synchronize: true, // ❗️Solo para desarrollo (crea tablas automáticamente)
    }),
    CacheModule.register({ isGlobal: true }),
    UsersModule,
    RolesModule,
    AuthModule,
    MailServiceModule,
    MaterialModule,
  ],
})
export class AppModule {}
