// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { MailServiceModule } from './mail-service/mail-service.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '12345678',
      database: 'redsanpablotest',
      autoLoadEntities: true,
      synchronize: true, // ❗️Solo para desarrollo (crea tablas automáticamente)
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    MailServiceModule,
  ],
})
export class AppModule {}
