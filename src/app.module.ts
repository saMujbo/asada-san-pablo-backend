// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';

@Module({
  imports: [
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
    UserModule,
  ],
})
export class AppModule {}
