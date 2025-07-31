// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { Material } from './Gestion_de_Materiales/material/entities/material.entity';
import { Proyecto } from './Gestion_de_Materiales/proyecto/entities/proyecto.entity';
import { MaterialAsignado } from './Gestion_de_Materiales/material-asignado/entities/material-asignado.entity';

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
    UsersModule,
    RolesModule,
    AuthModule,
    Material,
    Proyecto,
    MaterialAsignado,
  ],
})
export class AppModule {}
