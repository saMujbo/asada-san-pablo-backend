import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsGateway } from './reports.gateway';
import { MailServiceService } from 'src/mail-service/mail-service.service';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportType)
    private readonly reportTypeRepository: Repository<ReportType>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ReportLocation)
    private readonly reportLocationRepository: Repository<ReportLocation>,
    private readonly reportsGateway: ReportsGateway,
     private readonly mailService: MailServiceService, 
  ) {}

  async create(createReportDto: CreateReportDto) {
    // Crear el reporte
    const report = this.reportRepository.create(createReportDto);
    const saved = await this.reportRepository.save(report);

    // Cargar el reporte con la información del usuario
    const loadReport = await this.reportRepository.findOne({
      where: { Id: saved.Id },
      relations: ['User', 'ReportLocation', 'ReportType'], // Esto carga la relación User y ReportLocation

    });

    if (!loadReport) {
      throw new Error('Error al crear el reporte');
    }

    // Emitir evento WebSocket con información del usuario y ubicación
    this.reportsGateway.emitReportCreated({
      Id: saved.Id,
      Location: loadReport.ReportLocation ? 
        `${loadReport.ReportLocation.Neighborhood} - ${saved.Location}` : 
        saved.Location,
      Description: saved.Description,
      User: {
        Id: loadReport.User.Id,
        Name: loadReport.User.Name,
        Email: loadReport.User.Email,
        FullName: `${loadReport.User.Name} ${loadReport.User.Surname1} ${loadReport.User.Surname2 || ''}`.trim(),
      },
      ReportLocation: loadReport.ReportLocation ? {
        Id: loadReport.ReportLocation.Id,
        Neighborhood: loadReport.ReportLocation.Neighborhood,
      } : null,
      ReportType: {
        Id: loadReport.ReportType.Id,
        Name: loadReport.ReportType.Name,
      },
      CreatedAt: saved.CreatedAt,
    });

    // Enviar correo (no bloquea la respuesta)
    this.mailService
      .sendReportCreatedEmail({
        // si no pasas "to", usará REPORTS_MAIL_TO del .env
        Id: saved.Id,
        Location: loadReport.ReportLocation ? 
          `${loadReport.ReportLocation.Neighborhood} - ${saved.Location}` : 
          saved.Location,
        Description: saved.Description ?? '',
        UserFullName: `${loadReport.User.Name} ${loadReport.User.Surname1} ${loadReport.User.Surname2 || ''}`.trim(),
        UserEmail: loadReport.User.Email,
        CreatedAt: new Date(saved.CreatedAt).toLocaleString('es-CR'),
      })
      .catch(console.error);

    return loadReport;
  }

  findAll() {
    return this.reportRepository.find({
      relations: ['User', 'ReportLocation'], // Incluir información del usuario y ubicación
      order: { CreatedAt: 'DESC' } // Ordenar por fecha más reciente primero
    });
  }

  findOne(id: number) {
    return this.reportRepository.findOne({
      where: { Id: id },
      relations: ['User', 'ReportLocation'] // Incluir información del usuario y ubicación
    });
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return this.reportRepository.update(id, updateReportDto);
  }

  remove(id: number) {
    return this.reportRepository.delete(id);
  }
}
