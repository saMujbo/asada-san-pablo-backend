import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { ProjectProjectionService } from './project-projection.service';
import { CreateProjectProjectionDto } from './dto/create-project-projection.dto';
import { UpdateProjectProjectionDto } from './dto/update-project-projection.dto';

@Controller('project-projection')
export class ProjectProjectionController {
  constructor(private readonly projectProjectionService: ProjectProjectionService) {}

  @Post()
  create(@Body() createProjectProjectionDto: CreateProjectProjectionDto) {
    return this.projectProjectionService.create(createProjectProjectionDto);
  }

  @Get()
  findAll() {
    return this.projectProjectionService.findAll();
  }

  @Get(':id/ProjectProjection')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.projectProjectionService.findOne(id);
  }

  @Put(':idProjectPro')
  update(@Param('Id',ParseIntPipe) Id: number, 
  @Body() updateProjectProjectionDto: UpdateProjectProjectionDto) {
    return this.projectProjectionService.update(Id, updateProjectProjectionDto);
  }

}
