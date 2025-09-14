import { Module } from '@nestjs/common';
import { TraceProjectProductService } from './trace-project_product.service';
import { TraceProjectProductController } from './trace-project_product.controller';

@Module({
  controllers: [TraceProjectProductController],
  providers: [TraceProjectProductService],
})
export class TraceProjectProductModule {}
