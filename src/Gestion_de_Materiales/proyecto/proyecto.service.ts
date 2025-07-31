import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
  ) {}

  async create(createDto: CreateProyectoDto) {
    const newProyecto = this.proyectoRepo.create(createDto);
    return await this.proyectoRepo.save(newProyecto);
  }

  async findAll() {
    return await this.proyectoRepo.find();
  }

  async findOne(id: number) {
    const proyecto = await this.proyectoRepo.findOneBy({ id });
    if (!proyecto) {
      throw new ConflictException(`Proyecto con id ${id} no encontrado`);
    }
    return proyecto;
  }

  async update(id: number, updateDto: UpdateProyectoDto) {
    const proyecto = await this.proyectoRepo.findOneBy({ id });
    if (!proyecto) {
      throw new ConflictException(`Proyecto con id ${id} no encontrado`);
    }
    const updated = this.proyectoRepo.merge(proyecto, updateDto);
    return await this.proyectoRepo.save(updated);
  }

  async remove(id: number) {
    const proyecto = await this.proyectoRepo.findOneBy({ id });
    if (!proyecto) {
      throw new ConflictException(`Proyecto con id ${id} no encontrado`);
    }
    return await this.proyectoRepo.remove(proyecto);
  }
}
