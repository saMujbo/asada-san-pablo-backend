import { Module } from '@nestjs/common';
import { MaterialAsignadoService } from './material-asignado.service';
import { MaterialAsignadoController } from './material-asignado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialAsignado } from './entities/material-asignado.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([MaterialAsignado]),
    ],
  controllers: [MaterialAsignadoController],
  providers: [MaterialAsignadoService],
})
export class MaterialAsignadoModule {}
