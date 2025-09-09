import { forwardRef, Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Material]),
    forwardRef(() => ProductModule),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports:[MaterialService]
})
export class MaterialModule {}
