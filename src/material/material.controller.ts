import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Put, Query } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/auth-roles/roles.decorator';
import { Role } from 'src/auth/auth-roles/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MaterialPaginationDto } from './dto/pagination-material.st';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN) 
@ApiBearerAuth()
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.create(createMaterialDto);
  }

  @Get()
  findAll() {
    return this.materialService.findAll();
  }
  @Get('search')
  search(@Query() pagination:MaterialPaginationDto){
    return this.materialService.search(pagination);
  }
  
  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.materialService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, 
  @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.remove(id);
  }
}
