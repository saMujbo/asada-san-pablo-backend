import { Module } from '@nestjs/common';
import { ProjectProductService } from './project_product.service';
import { ProjectProductController } from './project_product.controller';

@Module({
  controllers: [ProjectProductController],
  providers: [ProjectProductService],
})
export class ProjectProductModule {}
