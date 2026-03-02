import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportLocationDto } from './dto/create-report-location.dto';
import { UpdateReportLocationDto } from './dto/update-report-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportLocation } from './entities/report-location.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ReportLocationService {
  constructor(
    @InjectRepository(ReportLocation)
    private reportLocationRepository: Repository<ReportLocation>,
  ){}

  async create(createReportLocationDto: CreateReportLocationDto) {
    // verificar si la ubicación ya existe
    const found = await this.reportLocationRepository.findOne({
      where: {Neighborhood: createReportLocationDto.Neighborhood}
    });

    if(found) {
      throw new HttpException('La ubicación ya existe', HttpStatus.BAD_REQUEST);
    }

    createReportLocationDto.Neighborhood = createReportLocationDto.Neighborhood.toUpperCase();
    const saved = await this.reportLocationRepository.save(createReportLocationDto);
    return saved;
  }

  async findAll() {
    const found = await this.reportLocationRepository.find();
    if(!found) {
      throw new HttpException('No se encontraron ubicaciones', HttpStatus.NOT_FOUND);
    }
    return found;
  }

  async findOne(id: number) {
    return await this.reportLocationRepository.findOne({ where: { Id: id } });
  }
  

  async update(id: number, updateReportLocationDto: UpdateReportLocationDto) {
    const found = await this.reportLocationRepository.findOne({ where: { Id: id } });
    if(!found) {
      throw new NotFoundException('La ubicación no existe');
    }
    if(updateReportLocationDto.Neighborhood !== undefined && updateReportLocationDto.Neighborhood != null && updateReportLocationDto.Neighborhood !== '') {
      found.Neighborhood = updateReportLocationDto.Neighborhood.toUpperCase();
    }
    if(updateReportLocationDto.IsActive !== undefined && updateReportLocationDto.IsActive != null) {
      found.IsActive = updateReportLocationDto.IsActive;
    }
    return await this.reportLocationRepository.save(found); 
  }

  async remove(id: number) {
    const found = await this.reportLocationRepository.findOne({ where: { Id: id } });
    if(!found) {
      throw new NotFoundException('La ubicación no existe');
    }
    if(found.IsActive) {
      throw new BadRequestException('La ubicación no puede ser eliminada porque tiene reportes asociados');
    }
    await this.reportLocationRepository.delete(id);
    return { message: 'Ubicación eliminada correctamente' };  
  }
}
