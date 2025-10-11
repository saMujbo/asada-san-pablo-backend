import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsGateway } from './reports.gateway';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly reportsGateway: ReportsGateway,
  ) {}

  async create(createReportDto: CreateReportDto) {
    const report = this.reportRepository.create(createReportDto);
    const saved = await this.reportRepository.save(report);

    this.reportsGateway.emitReportCreated({
      Id: saved.Id,
      Location: saved.Location,
    });

    return saved;
  }

  findAll() {
    return this.reportRepository.find();
  }

  findOne(id: number) {
    return this.reportRepository.findOneBy({ Id: id });
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return this.reportRepository.update(id, updateReportDto);
  }

  remove(id: number) {
    return this.reportRepository.delete(id);
  }
}
