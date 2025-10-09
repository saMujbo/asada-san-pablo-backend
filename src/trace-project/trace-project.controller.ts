import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TraceProjectService } from './trace-project.service';
import { CreateTraceProjectDto } from './dto/create-trace-project.dto';
import { UpdateTraceProjectDto } from './dto/update-trace-project.dto';

@Controller('trace-project')
export class TraceProjectController {
  constructor(private readonly traceProjectService: TraceProjectService) {}

  @Post()
  create(@Body() createTraceProjectDto: CreateTraceProjectDto) {
    return this.traceProjectService.create(createTraceProjectDto);
  }

  @Get()
  findAll() {
    return this.traceProjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.traceProjectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, 
  @Body() updateTraceProjectDto: UpdateTraceProjectDto) {
    return this.traceProjectService.update(id, updateTraceProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.traceProjectService.remove(+id);
  }
}
