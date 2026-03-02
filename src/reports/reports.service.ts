import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { ReportState } from 'src/report-states/entities/report-state.entity';
import { ReportsPaginationDto } from './dto/Pagination-report.dto';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';

type MonthlyOpts = {
  months?: number;            // por defecto 12
  stateName?: string;         // opcional, ej: 'En Proceso'
  locationId?: number;        // opcional
  reportTypeId?: number;      // opcional
};
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
    @InjectRepository(ReportState)
    private readonly reportStateRepository: Repository<ReportState>,
    private readonly reportsGateway: ReportsGateway,
    private readonly mailService: MailServiceService,
  ) {}

  /**
   * Valida que todas las entidades referenciadas existan antes de crear/actualizar un reporte.
   */
  private async validateReportRelations(dto: {
    UserId: number;
    LocationId: number;
    ReportTypeId: number;
    ReportStateId?: number;
    UserInChargeId?: number;
  }) {
    const user = await this.usersRepository.findOne({ where: { Id: dto.UserId } });
    if (!user) {
      throw new BadRequestException(`No existe un usuario con ID ${dto.UserId}`);
    }

    const location = await this.reportLocationRepository.findOne({ where: { Id: dto.LocationId } });
    if (!location) {
      throw new BadRequestException(`No existe una ubicación con ID ${dto.LocationId}`);
    }

    const reportType = await this.reportTypeRepository.findOne({ where: { Id: dto.ReportTypeId } });
    if (!reportType) {
      throw new BadRequestException(`No existe un tipo de reporte con ID ${dto.ReportTypeId}`);
    }

    if (dto.ReportStateId != null) {
      const reportState = await this.reportStateRepository.findOne({
        where: { IdReportState: dto.ReportStateId },
      });
      if (!reportState) {
        throw new BadRequestException(`No existe un estado de reporte con ID ${dto.ReportStateId}`);
      }
    }

    if (dto.UserInChargeId != null) {
      const userInCharge = await this.usersRepository.findOne({ where: { Id: dto.UserInChargeId } });
      if (!userInCharge) {
        throw new BadRequestException(`No existe un usuario encargado con ID ${dto.UserInChargeId}`);
      }
    }
  }

  /**
   * Genera un código único por día: RPT-yyyymmdd-001 (siglas + fecha + secuencia diaria).
   */
  private async generateReportCode(): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yyyy}${mm}${dd}`;

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.CreatedAt >= :start', { start: startOfDay })
      .andWhere('report.CreatedAt <= :end', { end: endOfDay })
      .getCount();

    const sequence = String(count + 1).padStart(3, '0');
    return `RPT-${datePrefix}-${sequence}`;
  }

  async create(createReportDto: CreateReportDto) {
    await this.validateReportRelations(createReportDto);

    const report = this.reportRepository.create(createReportDto);
    report.Code = await this.generateReportCode();
    const saved = await this.reportRepository.save(report);

    const loadReport = await this.reportRepository.findOne({
      where: { Id: saved.Id },
      relations: ['User', 'ReportLocation', 'ReportType', 'ReportState', 'UserInCharge'],
    });

    if (!loadReport) {
      throw new NotFoundException('Error al cargar el reporte creado');
    }

    // Emitir evento WebSocket con información del usuario y ubicación
    this.reportsGateway.emitReportCreated({
      Id: saved.Id,
      Code: saved.Code ?? undefined,
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
      ReportState: loadReport.ReportState ? {
        Id: loadReport.ReportState.IdReportState,
        Name: loadReport.ReportState.Name,
      } : null,
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
    await this.validateReportRelations(createReportDto);
    const report = this.reportRepository.create(createReportDto);
    report.Code = await this.generateReportCode();
    const saved = await this.reportRepository.save(report);
    const loadReport = await this.reportRepository.findOne({
      where: { Id: saved.Id },
    });
    if (!loadReport) {
      throw new NotFoundException('Error al cargar el reporte creado');
    }
    return loadReport;
  }

  async findAll(paginationDto: ReportsPaginationDto): Promise<PaginatedResponse<Report>> {
    const page = Math.max(1, Number(paginationDto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(paginationDto.limit) || 10));
    const skip = (page - 1) * limit;
    const { stateId, locationId, reportTypeId, q, startDate, endDate } = paginationDto;

    const validStateId = stateId != null && Number.isInteger(stateId) && stateId >= 1 ? stateId : undefined;
    const validLocationId = locationId != null && Number.isInteger(locationId) && locationId >= 1 ? locationId : undefined;
    const validReportTypeId = reportTypeId != null && Number.isInteger(reportTypeId) && reportTypeId >= 1 ? reportTypeId : undefined;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.User', 'user')
      .leftJoinAndSelect('report.UserInCharge', 'userInCharge')
      .leftJoinAndSelect('report.ReportLocation', 'reportLocation')
      .leftJoinAndSelect('report.ReportType', 'reportType')
      .leftJoinAndSelect('report.ReportState', 'reportState')
      .skip(skip)
      .take(limit)
      .orderBy('report.CreatedAt', paginationDto.sortDir === 'DESC' ? 'DESC' : 'ASC');

    if (validStateId != null) {
      qb.andWhere('report.ReportStateId = :stateId', { stateId: validStateId });
    }
    if (validLocationId != null) {
      qb.andWhere('report.LocationId = :locationId', { locationId: validLocationId });
    }
    if (validReportTypeId != null) {
      qb.andWhere('report.ReportTypeId = :reportTypeId', { reportTypeId: validReportTypeId });
    }

    if (q?.trim()) {
      const term = `%${q.trim().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      qb.andWhere(
        '(report.Code LIKE :term OR report.Description LIKE :term OR report.Location LIKE :term OR report.AdditionalInfo LIKE :term)',
        { term },
      );
    }

    if (startDate) {
      const from = new Date(startDate);
      from.setHours(0, 0, 0, 0);
      qb.andWhere('report.CreatedAt >= :startDate', { startDate: from });
    }
    if (endDate) {
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      qb.andWhere('report.CreatedAt <= :endDate', { endDate: to });
    }

    const [data, totalItems] = await qb.getManyAndCount();

    return {
      data,
      meta: buildPaginationMeta({
        totalItems,
        page,
        limit,
        itemCount: data.length,
      }),
    };
  }

  findOne(id: number) {
    return this.reportRepository.findOne({
      where: { Id: id },
      relations: ['User', 'ReportLocation', 'ReportType', 'ReportState', 'UserInCharge'] // Incluir todas las relaciones
    });
  }

  async update(id: number, updateReportDto: UpdateReportDto) {
    const existingReport = await this.reportRepository.findOne({ where: { Id: id } });
    if (!existingReport) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (updateReportDto.UserInChargeId != null) {
      const user = await this.usersRepository.findOne({ where: { Id: updateReportDto.UserInChargeId } });
      if (!user) {
        throw new BadRequestException(`No existe un usuario encargado con ID ${updateReportDto.UserInChargeId}`);
      }
    }

    // Actualizar el reporte
    await this.reportRepository.update(id, updateReportDto);

    // Retornar el reporte actualizado con todas las relaciones
    return this.reportRepository.findOne({
      where: { Id: id },
      relations: ['User', 'UserInCharge', 'ReportLocation', 'ReportType', 'ReportState']
    });
  }

  remove(id: number) {
    return this.reportRepository.delete(id);
  }

  async countByState(stateId: number): Promise<number> {
    return this.reportRepository.count({
      where: { ReportStateId: stateId }, 
    });
  }

  // 👉 Devuelve [{ year, month, count }] para los últimos N meses (rellenado con ceros)
  async getMonthlyCounts({ months = 12, stateName, locationId, reportTypeId }: MonthlyOpts) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1); // desde el primer día del mes N-meses-atrás
    from.setHours(0, 0, 0, 0);

    const qb = this.reportRepository
      .createQueryBuilder('r')
      .select('YEAR(r.CreatedAt)', 'year')   // MySQL/MariaDB y SQL Server soportan YEAR/MONTH
      .addSelect('MONTH(r.CreatedAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('r.CreatedAt >= :from', { from });

    // Filtros opcionales
    if (stateName) {
      qb.leftJoin('r.ReportState', 's')
        .andWhere('LOWER(s.Name) = LOWER(:stateName)', { stateName });
    }
    if (locationId) qb.andWhere('r.LocationId = :locationId', { locationId });
    if (reportTypeId) qb.andWhere('r.ReportTypeId = :reportTypeId', { reportTypeId });

    qb.groupBy('YEAR(r.CreatedAt)')
      .addGroupBy('MONTH(r.CreatedAt)')
      .orderBy('YEAR(r.CreatedAt)', 'ASC')
      .addOrderBy('MONTH(r.CreatedAt)', 'ASC');

    const raw = await qb.getRawMany<{ year: string; month: string; count: string }>();

    // Rellenar meses faltantes con 0 para que el gráfico sea continuo
    const map = new Map<string, number>();
    raw.forEach(r => {
      const key = `${r.year}-${String(r.month).padStart(2, '0')}`;
      map.set(key, Number(r.count));
    });

    const result: Array<{ year: number; month: number; count: number }> = [];
    const cursor = new Date(from);
    for (let i = 0; i < months; i++) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      result.push({ year: y, month: m, count: map.get(key) ?? 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return result;
  }

  async countAllByUser(userId: number): Promise<number> {
    return this.reportRepository
      .createQueryBuilder('r')
      .where('r.UserId = :uid', { uid: userId })
      .getCount();
  }

  async countByStateNameForUser(userId: number, stateName: string): Promise<number> {
    return this.reportRepository
      .createQueryBuilder('r')
      .leftJoin('r.ReportState', 's')
      .where('r.UserId = :uid', { uid: userId })
      .andWhere('LOWER(TRIM(s.Name)) = LOWER(TRIM(:name))', { name: stateName })
      .getCount();
  }

  /** Resumen común (total, en proceso, resueltos) por usuario */
  async getMyReportsSummary(userId: number) {
    const [total, inProcess] = await Promise.all([
      this.countAllByUser(userId),
      this.countByStateNameForUser(userId, 'En Proceso'),
    ]);
    return { total, inProcess };
  }

  async assignUserInCharge(reportId: number, userInChargeId: number) {
    // Verificar que el reporte existe
    const report = await this.reportRepository.findOne({ where: { Id: reportId } });
    if (!report) {
      throw new Error('Reporte no encontrado');
    }

    // Verificar que el usuario existe
    const user = await this.usersRepository.findOne({ where: { Id: userInChargeId } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Asignar el usuario al reporte
    report.UserInChargeId = userInChargeId;
    const updatedReport = await this.reportRepository.save(report);

    // Cargar el reporte con todas las relaciones para retornar información completa
    return this.reportRepository.findOne({
      where: { Id: reportId },
      relations: ['User', 'UserInCharge', 'ReportLocation', 'ReportType', 'ReportState']
    });
  }



}
