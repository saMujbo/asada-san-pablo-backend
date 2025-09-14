import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectProductService } from './project_product.service';
import { CreateProjectProductDto } from './dto/create-project_product.dto';
import { UpdateProjectProductDto } from './dto/update-project_product.dto';

@Controller('project-product')
export class ProjectProductController {
  constructor(private readonly projectProductService: ProjectProductService) {}

  @Post()
  create(@Body() createProjectProductDto: CreateProjectProductDto) {
    return this.projectProductService.create(createProjectProductDto);
  }

  @Get()
  findAll() {
    return this.projectProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectProductService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectProductDto: UpdateProjectProductDto) {
    return this.projectProductService.update(+id, updateProjectProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectProductService.remove(+id);
  }
}
