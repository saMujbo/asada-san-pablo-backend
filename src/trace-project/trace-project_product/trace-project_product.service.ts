import { Injectable } from '@nestjs/common';
import { CreateTraceProjectProductDto } from './dto/create-trace-project_product.dto';
import { UpdateTraceProjectProductDto } from './dto/update-trace-project_product.dto';

@Injectable()
export class TraceProjectProductService {
  create(createTraceProjectProductDto: CreateTraceProjectProductDto) {
    return 'This action adds a new traceProjectProduct';
  }

  findAll() {
    return `This action returns all traceProjectProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} traceProjectProduct`;
  }

  update(id: number, updateTraceProjectProductDto: UpdateTraceProjectProductDto) {
    return `This action updates a #${id} traceProjectProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} traceProjectProduct`;
  }
}
