import { Injectable } from '@nestjs/common';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { UpdateReportTypeDto } from './dto/update-report-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportType } from './entities/report-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReportTypesService {
  constructor (
    @InjectRepository(ReportType)
    private reportTypeRepository: Repository<ReportType>,
  ) {}


  async create(createReportTypeDto: CreateReportTypeDto) {
    const found = await this.reportTypeRepository.findOne({ where: { Name: createReportTypeDto.Name } });

    // hacer que sea uppercase
    if (found) {
      throw new Error('El tipo de reporte ya existe');
    }
    
    createReportTypeDto.Name = createReportTypeDto.Name.toUpperCase();
    const reportType = this.reportTypeRepository.create(createReportTypeDto);
    return this.reportTypeRepository.save(reportType);
  }

  async findAll() {
    const found = await this.reportTypeRepository.find();
    if (!found) {
      throw new Error('No se encontraron tipos de reportes');
    }
    return found;
  }

  findOne(id: number) {
    return `This action returns a #${id} reportType`;
  }

  update(id: number, updateReportTypeDto: UpdateReportTypeDto) {
    return `This action updates a #${id} reportType`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportType`;
  }
}
