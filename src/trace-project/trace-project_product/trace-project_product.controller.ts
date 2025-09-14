import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TraceProjectProductService } from './trace-project_product.service';
import { CreateTraceProjectProductDto } from './dto/create-trace-project_product.dto';
import { UpdateTraceProjectProductDto } from './dto/update-trace-project_product.dto';

@Controller('trace-project-product')
export class TraceProjectProductController {
  constructor(private readonly traceProjectProductService: TraceProjectProductService) {}

  @Post()
  create(@Body() createTraceProjectProductDto: CreateTraceProjectProductDto) {
    return this.traceProjectProductService.create(createTraceProjectProductDto);
  }

  @Get()
  findAll() {
    return this.traceProjectProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.traceProjectProductService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTraceProjectProductDto: UpdateTraceProjectProductDto) {
    return this.traceProjectProductService.update(+id, updateTraceProjectProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.traceProjectProductService.remove(+id);
  }
}
