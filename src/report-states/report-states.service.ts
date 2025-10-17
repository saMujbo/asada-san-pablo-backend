import { Injectable } from '@nestjs/common';
import { CreateReportStateDto } from './dto/create-report-state.dto';
import { UpdateReportStateDto } from './dto/update-report-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportState } from './entities/report-state.entity';

@Injectable()
export class ReportStatesService {
  constructor(
    @InjectRepository(ReportState)
    private  reportStateRepository: Repository<ReportState>,
  ) {}

  async create(createReportStateDto: CreateReportStateDto) {
    const found = await this.reportStateRepository.findOne({
      where: { Name: createReportStateDto.Name },
    });
    if (found) {
      throw new Error('El estado del reporte ya existe');
    }
    const reportState = this.reportStateRepository.create(createReportStateDto);
    return this.reportStateRepository.save(reportState);
  }

  async findAll() {
    const found = await this.reportStateRepository.find();
    if (!found) {
      throw new Error('No se encontraron estados de reportes');
    }
    return found;
  }

  findOne(id: number) {
    return `This action returns a #${id} reportState`;
  }

  update(id: number, updateReportStateDto: UpdateReportStateDto) {
    return `This action updates a #${id} reportState`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportState`;
  }
}
