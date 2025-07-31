import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards,} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProyectosService } from '../proyecto/proyecto.service';
import { CreateProyectoDto } from '../proyecto/dto/create-proyecto.dto';
import { UpdateProyectoDto } from '../proyecto/dto/update-proyecto.dto';

@ApiBearerAuth()
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}


  @Post()
  create(@Body() createDto: CreateProyectoDto) {
    return this.proyectosService.create(createDto);
  }


  @Get()
  findAll() {
    return this.proyectosService.findAll();
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProyectoDto,
  ) {
    return this.proyectosService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.remove(id);
  }
}
