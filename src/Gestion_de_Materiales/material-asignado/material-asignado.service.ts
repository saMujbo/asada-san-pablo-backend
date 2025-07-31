import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialAsignado } from './entities/material-asignado.entity';
import { CreateMaterialAsignadoDto } from './dto/create-material-asignado.dto';
import { UpdateMaterialAsignadoDto } from './dto/update-material-asignado.dto';

@Injectable()
export class MaterialAsignadoService {
  constructor(
    @InjectRepository(MaterialAsignado)
    private readonly asignadoRepo: Repository<MaterialAsignado>,
  ) {}

  async create(createDto: CreateMaterialAsignadoDto) {
    const nuevo = this.asignadoRepo.create({
      ...createDto,
      material: { id: createDto.materialId },
      proyecto: { id: createDto.proyectoId },
    });
    return await this.asignadoRepo.save(nuevo);
  }

  async findAll() {
    return await this.asignadoRepo.find();
  }

  async findOne(id: number) {
    const found = await this.asignadoRepo.findOneBy({ id });
    if (!found) {
      throw new ConflictException(`Asignación con id ${id} no encontrada`);
    }
    return found;
  }

  async update(id: number, updateDto: UpdateMaterialAsignadoDto) {
    const asignado = await this.asignadoRepo.findOneBy({ id });
    if (!asignado) {
      throw new ConflictException(`Asignación con id ${id} no encontrada`);
    }
    const updated = this.asignadoRepo.merge(asignado, {
      ...updateDto,
      material: updateDto.materialId ? { id: updateDto.materialId } : asignado.material,
      proyecto: updateDto.proyectoId ? { id: updateDto.proyectoId } : asignado.proyecto,
    });
    return await this.asignadoRepo.save(updated);
  }

  async remove(id: number) {
    const asignado = await this.asignadoRepo.findOneBy({ id });
    if (!asignado) {
      throw new ConflictException(`Asignación con id ${id} no encontrada`);
    }
    return await this.asignadoRepo.remove(asignado);
  }
}
