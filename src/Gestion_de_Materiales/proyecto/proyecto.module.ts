import { Module } from '@nestjs/common';
import { ProyectosService } from './proyecto.service';
import { ProyectosController } from './proyecto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';

@Module({
  imports:[
        TypeOrmModule.forFeature([Proyecto]),
      ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
})
export class ProyectoModule {}
