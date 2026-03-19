import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as PDFDocument from 'pdfkit';
import { Repository } from 'typeorm';
import { MailServiceService } from 'src/mail-service/mail-service.service';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { User } from 'src/users/entities/user.entity';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsPaginationDto } from './dto/Pagination-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { ReportAssignment } from './entities/report-assignment.entity';
import { ReportStateHistory } from './entities/report-state-history.entity';
import { ReportStateEnum } from './enums/report-state.enum';
import { ReportsGateway } from './reports.gateway';

type MonthlyOpts = {
  months?: number;
  state?: ReportStateEnum;
  reportLocationId?: number;
  reportTypeId?: number;
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ReportLocation)
    private readonly reportLocationRepository: Repository<ReportLocation>,
    @InjectRepository(ReportType)
    private readonly reportTypeRepository: Repository<ReportType>,
    @InjectRepository(ReportAssignment)
    private readonly reportAssignmentRepository: Repository<ReportAssignment>,
    @InjectRepository(ReportStateHistory)
    private readonly reportStateHistoryRepository: Repository<ReportStateHistory>,
    private readonly reportsGateway: ReportsGateway,
    private readonly mailService: MailServiceService,
  ) {}

  private async validateReportRelations(dto: {
    ReportLocationId?: number;
    ReportTypeId?: number;
    ReportedByUserId?: number;
  }) {
    if (dto.ReportLocationId != null) {
      const location = await this.reportLocationRepository.findOne({ where: { Id: dto.ReportLocationId } });
      if (!location) {
        throw new BadRequestException(`No existe una ubicación con ID ${dto.ReportLocationId}`);
      }
    }

    if (dto.ReportTypeId != null) {
      const reportType = await this.reportTypeRepository.findOne({ where: { Id: dto.ReportTypeId } });
      if (!reportType) {
        throw new BadRequestException(`No existe un tipo de reporte con ID ${dto.ReportTypeId}`);
      }
    }

    if (dto.ReportedByUserId != null) {
      const reportedBy = await this.usersRepository.findOne({ where: { Id: dto.ReportedByUserId } });
      if (!reportedBy) {
        throw new BadRequestException(`No existe un usuario con ID ${dto.ReportedByUserId}`);
      }
    }
  }

  private async generateReportCode(): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yyyy}${mm}${dd}`;

    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
      const candidate = `RPT-${datePrefix}-${suffix}`;
      const exists = await this.reportRepository.exists({ where: { Code: candidate } });
      if (!exists) {
        return candidate;
      }
    }

    throw new BadRequestException('No fue posible generar un código único para el reporte');
  }

  private async createStateHistory(params: {
    reportId: number;
    previousState: ReportStateEnum | null;
    newState: ReportStateEnum;
    reasonChange: string;
    changedByUserId: number;
  }) {
    const history = this.reportStateHistoryRepository.create({
      ReportId: params.reportId,
      PreviousState: params.previousState,
      NewState: params.newState,
      ReasonChange: params.reasonChange,
      ChangedByUserId: params.changedByUserId,
    });

    await this.reportStateHistoryRepository.save(history);
  }

  private async loadReport(id: number): Promise<Report | null> {
    const report = await this.reportRepository.findOne({
      where: { Id: id },
      relations: [
        'ReportLocation',
        'ReportType',
        'ReportedBy',
        'Assignment',
        'Assignment.Plumber',
        'Assignment.AssignedBy',
        'StateHistory',
        'StateHistory.ChangedBy',
      ],
    });

    if (report?.StateHistory) {
      report.StateHistory = [...report.StateHistory].sort(
        (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
      );
    }

    return report;
  }

  private async validatePlumberUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { Id: userId },
      relations: ['Roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPlumber = (user.Roles ?? []).some((role) => role.Rolname === 'FONTANERO');
    if (!isPlumber) {
      throw new BadRequestException('El usuario asignado no tiene rol FONTANERO');
    }

    return user;
  }

  private ensureValidStateTransition(currentState: ReportStateEnum, newState: ReportStateEnum) {
    if (currentState === newState) {
      throw new BadRequestException('El reporte ya se encuentra en ese estado');
    }

    const allowedTransitions: Record<ReportStateEnum, ReportStateEnum[]> = {
      [ReportStateEnum.PENDIENTE]: [ReportStateEnum.EN_PROCESO],
      [ReportStateEnum.EN_PROCESO]: [ReportStateEnum.PENDIENTE, ReportStateEnum.RESUELTO],
      [ReportStateEnum.RESUELTO]: [ReportStateEnum.EN_PROCESO],
    };

    if (!allowedTransitions[currentState].includes(newState)) {
      throw new BadRequestException(`No se puede cambiar de "${currentState}" a "${newState}"`);
    }
  }

  private parseReportState(value: string): ReportStateEnum {
    const normalized = (value ?? '').trim().toLowerCase();
    const match = Object.values(ReportStateEnum).find((state) => state.toLowerCase() === normalized);
    if (!match) {
      throw new BadRequestException('El estado solicitado no es válido');
    }
    return match;
  }

  async create(createReportDto: CreateReportDto) {
    await this.validateReportRelations({
      ReportLocationId: createReportDto.ReportLocationId,
      ReportTypeId: createReportDto.ReportTypeId,
      ReportedByUserId: createReportDto.UserId,
    });

    const report = this.reportRepository.create({
      ...createReportDto,
      Code: await this.generateReportCode(),
      ReportState: ReportStateEnum.PENDIENTE,
      ReportedByUserId: createReportDto.UserId,
    });

    const saved = await this.reportRepository.save(report);

    await this.createStateHistory({
      reportId: saved.Id,
      previousState: null,
      newState: ReportStateEnum.PENDIENTE,
      reasonChange: 'Creación del reporte',
      changedByUserId: createReportDto.UserId,
    });

    const loadedReport = await this.loadReport(saved.Id);
    if (!loadedReport) {
      throw new NotFoundException('Error al cargar el reporte creado');
    }

    this.reportsGateway.emitReportCreated({
      Id: loadedReport.Id,
      Code: loadedReport.Code,
      ExactLocation: loadedReport.ExactLocation,
      Description: loadedReport.Description,
      ReportState: loadedReport.ReportState,
      CreatedAt: loadedReport.CreatedAt,
      ReportLocation: {
        Id: loadedReport.ReportLocation.Id,
        Neighborhood: loadedReport.ReportLocation.Neighborhood,
      },
      ReportType: {
        Id: loadedReport.ReportType.Id,
        Name: loadedReport.ReportType.Name,
      },
      ReportedBy: {
        Id: loadedReport.ReportedBy.Id,
        Name: loadedReport.ReportedBy.Name,
        Email: loadedReport.ReportedBy.Email,
        FullName: `${loadedReport.ReportedBy.Name} ${loadedReport.ReportedBy.Surname1} ${loadedReport.ReportedBy.Surname2 || ''}`.trim(),
      },
    });

    this.mailService
      .sendReportCreatedEmail({
        Id: loadedReport.Id,
        Location: `${loadedReport.ReportLocation.Neighborhood} - ${loadedReport.ExactLocation}`,
        Description: loadedReport.Description,
        UserFullName: `${loadedReport.ReportedBy.Name} ${loadedReport.ReportedBy.Surname1} ${loadedReport.ReportedBy.Surname2 || ''}`.trim(),
        UserEmail: loadedReport.ReportedBy.Email,
        CreatedAt: new Date(loadedReport.CreatedAt).toLocaleString('es-CR'),
      })
      .catch(console.error);

    return loadedReport;
  }

  async findAll(paginationDto: ReportsPaginationDto): Promise<PaginatedResponse<Report>> {
    const page = Math.max(1, Number(paginationDto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(paginationDto.limit) || 10));
    const skip = (page - 1) * limit;
    const { state, reportLocationId, reportTypeId, plumberUserId, q, startDate, endDate } = paginationDto;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.ReportLocation', 'reportLocation')
      .leftJoinAndSelect('report.ReportType', 'reportType')
      .leftJoinAndSelect('report.ReportedBy', 'reportedBy')
      .leftJoinAndSelect('report.Assignment', 'assignment')
      .leftJoinAndSelect('assignment.Plumber', 'plumber')
      .leftJoinAndSelect('assignment.AssignedBy', 'assignedBy')
      .skip(skip)
      .take(limit)
      .orderBy('report.CreatedAt', paginationDto.sortDir === 'ASC' ? 'ASC' : 'DESC');

    if (state) {
      qb.andWhere('report.ReportState = :state', { state });
    }

    if (reportLocationId != null) {
      qb.andWhere('report.ReportLocationId = :reportLocationId', { reportLocationId });
    }

    if (reportTypeId != null) {
      qb.andWhere('report.ReportTypeId = :reportTypeId', { reportTypeId });
    }

    if (plumberUserId != null) {
      qb.andWhere('assignment.PlumberUserId = :plumberUserId', { plumberUserId });
    }

    if (q?.trim()) {
      const term = `%${q.trim().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      qb.andWhere(
        `(
          report.Code LIKE :term OR report.ExactLocation LIKE :term OR report.Description LIKE :term
          OR reportLocation.Neighborhood LIKE :term
          OR reportType.Name LIKE :term
          OR reportedBy.Name LIKE :term OR reportedBy.Surname1 LIKE :term OR reportedBy.Surname2 LIKE :term
          OR plumber.Name LIKE :term OR plumber.Surname1 LIKE :term OR plumber.Surname2 LIKE :term
        )`,
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
    return this.loadReport(id);
  }

  async update(id: number, updateReportDto: UpdateReportDto) {
    const existingReport = await this.reportRepository.findOne({ where: { Id: id } });
    if (!existingReport) {
      throw new NotFoundException('Reporte no encontrado');
    }

    await this.validateReportRelations({
      ReportLocationId: updateReportDto.ReportLocationId,
      ReportTypeId: updateReportDto.ReportTypeId,
    });

    Object.assign(existingReport, updateReportDto);
    await this.reportRepository.save(existingReport);

    return this.loadReport(id);
  }

  async remove(id: number) {
    const existingReport = await this.reportRepository.findOne({ where: { Id: id } });
    if (!existingReport) {
      throw new NotFoundException('Reporte no encontrado');
    }

    await this.reportRepository.delete(id);
    return { message: 'Reporte eliminado correctamente' };
  }

  async countByState(state: ReportStateEnum): Promise<number> {
    return this.reportRepository.count({
      where: { ReportState: state },
    });
  }

  async getMonthlyCounts({ months = 12, state, reportLocationId, reportTypeId }: MonthlyOpts) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    const qb = this.reportRepository
      .createQueryBuilder('r')
      .select('YEAR(r.CreatedAt)', 'year')
      .addSelect('MONTH(r.CreatedAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('r.CreatedAt >= :from', { from });

    if (state) qb.andWhere('r.ReportState = :state', { state });
    if (reportLocationId) qb.andWhere('r.ReportLocationId = :reportLocationId', { reportLocationId });
    if (reportTypeId) qb.andWhere('r.ReportTypeId = :reportTypeId', { reportTypeId });

    qb.groupBy('YEAR(r.CreatedAt)')
      .addGroupBy('MONTH(r.CreatedAt)')
      .orderBy('YEAR(r.CreatedAt)', 'ASC')
      .addOrderBy('MONTH(r.CreatedAt)', 'ASC');

    const raw = await qb.getRawMany<{ year: string; month: string; count: string }>();
    const map = new Map<string, number>();

    raw.forEach((item) => {
      const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
      map.set(key, Number(item.count));
    });

    const result: Array<{ year: number; month: number; count: number }> = [];
    const cursor = new Date(from);
    for (let i = 0; i < months; i++) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      result.push({ year, month, count: map.get(key) ?? 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return result;
  }

  async getMonthlyCountsByLocation(opts: {
    months?: number;
    year?: number;
    month?: number;
  }): Promise<Array<{ locationId: number; neighborhood: string; year: number; month: number; count: number }>> {
    const { months = 12, year, month } = opts;
    const now = new Date();
    const from = new Date(now);

    if (year && month) {
      from.setFullYear(year, month - 1, 1);
      from.setHours(0, 0, 0, 0);
    } else {
      from.setMonth(from.getMonth() - (months - 1), 1);
      from.setHours(0, 0, 0, 0);
    }

    const qb = this.reportRepository
      .createQueryBuilder('r')
      .innerJoin('r.ReportLocation', 'loc')
      .select('loc.Id', 'locationId')
      .addSelect('loc.Neighborhood', 'neighborhood')
      .addSelect('YEAR(r.CreatedAt)', 'year')
      .addSelect('MONTH(r.CreatedAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('r.CreatedAt >= :from', { from });

    if (year && month) {
      qb.andWhere('YEAR(r.CreatedAt) = :year', { year }).andWhere('MONTH(r.CreatedAt) = :month', { month });
    }

    qb.groupBy('loc.Id')
      .addGroupBy('loc.Neighborhood')
      .addGroupBy('YEAR(r.CreatedAt)')
      .addGroupBy('MONTH(r.CreatedAt)')
      .orderBy('loc.Neighborhood', 'ASC')
      .addOrderBy('YEAR(r.CreatedAt)', 'ASC')
      .addOrderBy('MONTH(r.CreatedAt)', 'ASC');

    const raw = await qb.getRawMany<{
      locationId: string;
      neighborhood: string;
      year: string;
      month: string;
      count: string;
    }>();

    return raw.map((item) => ({
      locationId: Number(item.locationId),
      neighborhood: item.neighborhood,
      year: Number(item.year),
      month: Number(item.month),
      count: Number(item.count),
    }));
  }

  async getReportsForMonth(year: number, month: number): Promise<Report[]> {
    const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const to = new Date(year, month, 0, 23, 59, 59, 999);

    return this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.ReportLocation', 'reportLocation')
      .leftJoinAndSelect('report.ReportType', 'reportType')
      .leftJoinAndSelect('report.ReportedBy', 'reportedBy')
      .leftJoinAndSelect('report.Assignment', 'assignment')
      .leftJoinAndSelect('assignment.Plumber', 'plumber')
      .where('report.CreatedAt >= :from', { from })
      .andWhere('report.CreatedAt <= :to', { to })
      .orderBy('report.CreatedAt', 'DESC')
      .take(5000)
      .getMany();
  }

  async buildExportPdf(year: number, month: number): Promise<Buffer> {
    const [reports, byLocation] = await Promise.all([
      this.getReportsForMonth(year, month),
      this.getMonthlyCountsByLocation({ year, month }),
    ]);

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const title = `Reportes - ${monthNames[month - 1]} ${year}`;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Total de reportes: ${reports.length}`, { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(12).text('Listado de reportes', { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const colWidths = [62, 55, 90, 75, 60, 95, 95];
      const headers = ['Código', 'Fecha', 'Barrio', 'Estado', 'Tipo', 'Fontanero', 'Ubicación exacta'];
      doc.fontSize(9).font('Helvetica-Bold');

      let x = 50;
      headers.forEach((header, index) => {
        doc.text(header, x, tableTop, { width: colWidths[index], continued: false });
        x += colWidths[index];
      });

      doc.moveDown(0.3);
      doc.font('Helvetica');
      let y = doc.y;

      reports.forEach((report) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
          doc.font('Helvetica-Bold');
          headers.forEach((header, index) => {
            doc.text(header, 50 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0), y, { width: colWidths[index] });
          });
          doc.font('Helvetica');
          y += 14;
        }

        const row = [
          report.Code,
          new Date(report.CreatedAt).toLocaleDateString('es-CR'),
          report.ReportLocation?.Neighborhood ?? '-',
          report.ReportState,
          report.ReportType?.Name ?? '-',
          report.Assignment?.Plumber
            ? `${report.Assignment.Plumber.Name} ${report.Assignment.Plumber.Surname1}`.trim()
            : '-',
          report.ExactLocation,
        ];

        x = 50;
        row.forEach((cell, index) => {
          doc.text(String(cell), x, y, { width: colWidths[index], ellipsis: true });
          x += colWidths[index];
        });
        y += 14;
      });

      doc.y = y + 10;
      doc.moveDown(1.5);
      const chartTop = doc.y;

      doc.fontSize(12).text('Reportes por ubicación (mes seleccionado)', { underline: true });
      doc.moveDown(1);
      const chartLeft = 50;
      const chartW = 500;
      const chartH = 180;
      const maxCount = Math.max(1, ...byLocation.map((item) => item.count));
      const barH = byLocation.length ? (chartH - 20) / byLocation.length : 0;
      const barMaxW = chartW - 120;

      byLocation.forEach((row, index) => {
        const barY = chartTop + 30 + index * (barH + 2);
        doc.fontSize(8).fillColor('black').text(row.neighborhood, chartLeft, barY - 2, { width: 110 });
        const width = (row.count / maxCount) * barMaxW;
        doc.rect(chartLeft + 115, barY - 1, width, Math.min(barH - 2, 14)).fill('#4A90D9');
        doc.fillColor('black').text(String(row.count), chartLeft + 120 + width, barY - 2, { width: 30 });
      });

      doc.end();
    });
  }

  async countAllByUser(userId: number): Promise<number> {
    return this.reportRepository.count({
      where: { ReportedByUserId: userId },
    });
  }

  async countByStateNameForUser(userId: number, stateName: string): Promise<number> {
    const state = this.parseReportState(stateName);
    return this.reportRepository.count({
      where: {
        ReportedByUserId: userId,
        ReportState: state,
      },
    });
  }

  async getMyReportsSummary(userId: number) {
    const [total, pending, inProcess, resolved] = await Promise.all([
      this.countAllByUser(userId),
      this.reportRepository.count({ where: { ReportedByUserId: userId, ReportState: ReportStateEnum.PENDIENTE } }),
      this.reportRepository.count({ where: { ReportedByUserId: userId, ReportState: ReportStateEnum.EN_PROCESO } }),
      this.reportRepository.count({ where: { ReportedByUserId: userId, ReportState: ReportStateEnum.RESUELTO } }),
    ]);

    return { total, pending, inProcess, resolved };
  }

  async assignPlumber(reportId: number, plumberUserId: number, instructions: string, assignedByUserId: number) {
    const report = await this.reportRepository.findOne({ where: { Id: reportId } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (report.ReportState === ReportStateEnum.RESUELTO) {
      throw new BadRequestException('No se puede asignar un fontanero a un reporte resuelto');
    }

    await this.usersRepository.findOneOrFail({ where: { Id: assignedByUserId } }).catch(() => {
      throw new NotFoundException('Usuario asignador no encontrado');
    });
    await this.validatePlumberUser(plumberUserId);

    const assignment =
      (await this.reportAssignmentRepository.findOne({ where: { ReportId: reportId } })) ??
      this.reportAssignmentRepository.create({ ReportId: reportId });

    assignment.PlumberUserId = plumberUserId;
    assignment.AssignedByUserId = assignedByUserId;
    assignment.Instructions = instructions;
    await this.reportAssignmentRepository.save(assignment);

    if (report.ReportState === ReportStateEnum.PENDIENTE) {
      const previousState = report.ReportState;
      report.ReportState = ReportStateEnum.EN_PROCESO;
      await this.reportRepository.save(report);
      await this.createStateHistory({
        reportId,
        previousState,
        newState: ReportStateEnum.EN_PROCESO,
        reasonChange: 'Asignación de fontanero responsable',
        changedByUserId: assignedByUserId,
      });
    }

    return this.loadReport(reportId);
  }

  async changeState(reportId: number, newState: ReportStateEnum, reasonChange: string, changedByUserId: number) {
    const report = await this.reportRepository.findOne({ where: { Id: reportId } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    await this.usersRepository.findOneOrFail({ where: { Id: changedByUserId } }).catch(() => {
      throw new NotFoundException('Usuario no encontrado');
    });

    this.ensureValidStateTransition(report.ReportState, newState);

    if (newState === ReportStateEnum.EN_PROCESO || newState === ReportStateEnum.RESUELTO) {
      const assignment = await this.reportAssignmentRepository.findOne({ where: { ReportId: reportId } });
      if (!assignment) {
        throw new BadRequestException(`El reporte debe tener un fontanero asignado antes de pasar a "${newState}"`);
      }
    }

    const previousState = report.ReportState;
    report.ReportState = newState;
    await this.reportRepository.save(report);

    await this.createStateHistory({
      reportId,
      previousState,
      newState,
      reasonChange,
      changedByUserId,
    });

    return this.loadReport(reportId);
  }
}
