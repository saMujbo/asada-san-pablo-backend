import { Module } from '@nestjs/common';
import { MaterialsService } from './material.service';
import { MaterialsController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';

@Module({
  imports:[
        TypeOrmModule.forFeature([Material]),
      ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialModule {}
