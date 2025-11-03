import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
  

  update(id: number, updateReportLocationDto: UpdateReportLocationDto) {
    return `This action updates a #${id} reportLocation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportLocation`;
  }
}
