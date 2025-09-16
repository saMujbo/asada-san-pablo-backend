import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ProjectStateService } from './project-state.service';
import { CreateProjectStateDto } from './dto/create-project-state.dto';
import { UpdateProjectStateDto } from './dto/update-project-state.dto';

@Controller('project-state')
export class ProjectStateController {
  constructor(private readonly projectStateService: ProjectStateService) {}

  @Post()
  create(@Body() createProjectStateDto: CreateProjectStateDto) {
    return this.projectStateService.create(createProjectStateDto);
  }

  @Get()
  findAll() {
    return this.projectStateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectStateService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateProjectStateDto: UpdateProjectStateDto) {
    return this.projectStateService.update(id, updateProjectStateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.projectStateService.remove(id);
  }
}
