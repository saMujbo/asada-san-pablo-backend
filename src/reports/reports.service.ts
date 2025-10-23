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
import { ReportsPaginationDto } from './dto/Pagination-report.dto';

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
      relations: ['User', 'ReportLocation', 'ReportType', 'ReportState', 'UserInCharge'], // Esto carga la relación User y ReportLocation

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
      ReportState: {
        Id: loadReport.ReportState.IdReportState,
        Name: loadReport.ReportState.Name,
      },
      UserInCharge: loadReport.UserInCharge ? {
        Id: loadReport.UserInCharge.Id,
        Name: loadReport.UserInCharge.Name,
        Email: loadReport.UserInCharge.Email,
        FullName: `${loadReport.UserInCharge.Name} ${loadReport.UserInCharge.Surname1} ${loadReport.UserInCharge.Surname2 || ''}`.trim(),
      } : null,
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

  async createAdminReport(createReportDto: CreateReportDto) {
    // creamos el reporte y nada mas, sin necesidad de cargar relaciones ni emitir eventos
    const report = this.reportRepository.create(createReportDto);
    const saved = await this.reportRepository.save(report);
    const loadReport = await this.reportRepository.findOne({
      where: { Id: saved.Id },
    });
    return loadReport;
  }

  async findAll(paginationDto: ReportsPaginationDto){
    // Sanitiza page/limit (por si llegan como string o fuera de rango)
    const pageNum = Math.max(1, Number(paginationDto.page) || 1);
    const take = Math.min(100, Math.max(1, Number(paginationDto.limit) || 10));
    const skip = (pageNum - 1) * take;
    const { stateId, locationId, ReportTypeId } = paginationDto;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      // Relaciones (aunque tengas eager, aquí es explícito y optimiza el SELECT)
      .leftJoinAndSelect('report.User', 'user')
      .leftJoinAndSelect('report.UserInCharge', 'userInCharge')
      .leftJoinAndSelect('report.ReportLocation', 'reportLocation')
      .leftJoinAndSelect('report.ReportType', 'reportType')
      .leftJoinAndSelect('report.ReportState', 'reportState')
      .skip(skip)
      .take(take)
      .orderBy('report.CreatedAt', 'DESC');

    if (stateId) {
      qb.andWhere('report.ReportStateId = :stateId', { stateId });
    }
    if (locationId) {
      qb.andWhere('report.LocationId = :locationId', { locationId });
    }

    if (ReportTypeId) {
      qb.andWhere('report.ReportTypeId = :ReportTypeId', { ReportTypeId });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: take,
        pageCount: Math.max(1, Math.ceil(total / take)),
        hasNextPage: pageNum * take < total,
        hasPrevPage: pageNum > 1,
      },
    };
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

  async countByState(stateId: number): Promise<number> {
    return this.reportRepository.count({
      where: { ReportStateId: stateId }, 
    });
  }
}
