import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { QueryFailedError, Repository } from 'typeorm';
import { MailServiceService } from 'src/mail-service/mail-service.service';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { User } from 'src/users/entities/user.entity';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsPaginationDto } from './dto/Pagination-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { ReportStateHistory } from './entities/report-state-history.entity';
import { ReportStateEnum } from './enums/report-state.enum';
import { ReportsGateway } from './reports.gateway';

const ALLOWED_PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
    @InjectRepository(ReportStateHistory)
    private readonly reportStateHistoryRepository: Repository<ReportStateHistory>,
    private readonly reportsGateway: ReportsGateway,
    private readonly mailService: MailServiceService,
    private readonly dropboxService: DropboxService,
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
        'Plumber',
        'AssignedBy',
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

  private async uploadReportPhoto(photo: Express.Multer.File, code: string): Promise<string> {
    if (!ALLOWED_PHOTO_MIMES.includes(photo.mimetype)) {
      throw new BadRequestException('Formato de foto no válido. Use JPEG, PNG o WebP');
    }
    const ext = photo.originalname.split('.').pop()?.toLowerCase() ?? 'jpg';
    const dbxPath = `/Reportes/${code}/foto.${ext}`;
    await this.dropboxService.uploadBuffer(photo.buffer, dbxPath);
    return this.dropboxService.getFileSharedLink(dbxPath);
  }

  private isDuplicateReportCodeError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError = error.driverError as { code?: string; sqlMessage?: string } | undefined;
    return Boolean(
      driverError?.code === 'ER_DUP_ENTRY'
      && driverError?.sqlMessage?.includes('reports')
      && driverError.sqlMessage.includes('IDX_4f36c0536493c16558c9ccbe78')
    );
  }

  async create(createReportDto: CreateReportDto, photo?: Express.Multer.File) {
    await this.validateReportRelations({
      ReportLocationId: createReportDto.ReportLocationId,
      ReportTypeId: createReportDto.ReportTypeId,
      ReportedByUserId: createReportDto.UserId,
    });

    let saved: Report | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const code = (await this.generateReportCode()).trim();
      if (!code) {
        throw new BadRequestException('No fue posible generar un código válido para el reporte');
      }

      let photoUrl: string | null = null;
      if (photo) {
        photoUrl = await this.uploadReportPhoto(photo, code);
      }

      const report = this.reportRepository.create({
        ...createReportDto,
        Code: code,
        ReportState: ReportStateEnum.PENDIENTE,
        ReportedByUserId: createReportDto.UserId,
        PhotoUrl: photoUrl,
      });

      if (!report.Code?.trim()) {
        throw new BadRequestException('El código del reporte no puede quedar vacío');
      }

      try {
        saved = await this.reportRepository.save(report);
        break;
      } catch (error) {
        if (this.isDuplicateReportCodeError(error) && attempt < 2) {
          continue;
        }
        throw error;
      }
    }

    if (!saved) {
      throw new BadRequestException('No fue posible guardar el reporte con un código único');
    }

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
      PhotoUrl: loadedReport.PhotoUrl ?? undefined, // undefined instead of null to avoid type errors
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
      .leftJoinAndSelect('report.Plumber', 'plumber')
      .leftJoinAndSelect('report.AssignedBy', 'assignedBy')
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
      qb.andWhere('report.PlumberUserId = :plumberUserId', { plumberUserId });
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
      .leftJoinAndSelect('report.Plumber', 'plumber')
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

    const title = `Reportes - ${MONTH_NAMES[month - 1]} ${year}`;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      // Landscape A4: 841 x 595 — da 741pt de ancho útil (841 - 50*2)
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Trunca un texto para que quepa en maxWidth pt según la fuente/tamaño activos
      const fit = (text: string, maxWidth: number): string => {
        if (doc.widthOfString(text) <= maxWidth) return text;
        let t = text;
        while (t.length > 0 && doc.widthOfString(t + '…') > maxWidth) {
          t = t.slice(0, -1);
        }
        return t + '…';
      };

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Total de reportes: ${reports.length}`, { align: 'center' });
      doc.moveDown(1.2);

      doc.fontSize(12).text('Listado de reportes', { underline: true });
      doc.moveDown(0.5);

      // Layout tipo tarjeta: prioriza espacio para codigo, barrio y ubicacion
      const MARGIN   = 50;
      const TABLE_W  = 741;
      const CELL_PADDING_X = 6;
      const CELL_PADDING_Y = 6;
      const PRIMARY_COL_W = 210;
      const SECONDARY_COL_W = 160;
      const ROW_GAP = 8;
      const LABEL_GAP = 11;
      const MIN_TOP_ROW_H = 30;
      const MIN_MIDDLE_ROW_H = 30;
      const LOCATION_MIN_H = 28;
      const SECTION_H = 30;
      const PAGE_BOTTOM = 545; // landscape height 595 - margen inferior 50

      const measureCellHeight = (text: string, width: number, wrap = true): number => {
        const content = wrap ? text : fit(text, width);
        const textHeight = doc.heightOfString(content, {
          width,
          align: 'left',
          lineGap: 1,
        });
        return textHeight + CELL_PADDING_Y * 2;
      };

      const drawSectionHeader = (startY: number) => {
        doc.rect(MARGIN, startY, TABLE_W, SECTION_H).fill('#E8EEF5');
        doc.strokeColor('#C7D2E0').lineWidth(0.7).rect(MARGIN, startY, TABLE_W, SECTION_H).stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1F2937').text('Listado de reportes', MARGIN + 10, startY + 9, {
          width: TABLE_W - 20,
          align: 'left',
          lineBreak: false,
        });
        doc.font('Helvetica').fillColor('#111827');
      };

      let y = doc.y + 2;
      drawSectionHeader(y);
      y += SECTION_H + 10;

      doc.fontSize(9);
      reports.forEach((report, rowIndex) => {
        const codeValue = String(report.Code ?? '-');
        const dateValue = new Date(report.CreatedAt).toLocaleDateString('es-CR');
        const stateValue = String(report.ReportState ?? '-');
        const typeValue = String(report.ReportType?.Name ?? '-');
        const neighborhoodValue = String(report.ReportLocation?.Neighborhood ?? '-');
        const plumberValue = String(report.Plumber ? `${report.Plumber.Name} ${report.Plumber.Surname1}`.trim() : '-');
        const locationLabel = 'Ubicación exacta';
        const locationValue = String(report.ExactLocation ?? '-');

        const topRowHeight = Math.max(
          MIN_TOP_ROW_H,
          measureCellHeight(codeValue, PRIMARY_COL_W - CELL_PADDING_X * 2),
          measureCellHeight(dateValue, SECONDARY_COL_W - CELL_PADDING_X * 2, false),
          measureCellHeight(stateValue, SECONDARY_COL_W - CELL_PADDING_X * 2, false),
          measureCellHeight(typeValue, SECONDARY_COL_W - CELL_PADDING_X * 2, false),
        );
        const middleRowHeight = Math.max(
          MIN_MIDDLE_ROW_H,
          measureCellHeight(neighborhoodValue, PRIMARY_COL_W - CELL_PADDING_X * 2),
          measureCellHeight(plumberValue, TABLE_W - PRIMARY_COL_W - CELL_PADDING_X * 4),
        );
        const locationWidth = TABLE_W - CELL_PADDING_X * 2;
        const locationLabelHeight = doc.heightOfString(locationLabel, {
          width: locationWidth,
          lineGap: 1,
        });
        const locationValueHeight = doc.heightOfString(locationValue, {
          width: locationWidth,
          lineGap: 1,
        });
        const locationBlockHeight = Math.max(
          LOCATION_MIN_H,
          locationLabelHeight + locationValueHeight + CELL_PADDING_Y * 2 + 6,
        );
        const rowHeight = topRowHeight + middleRowHeight + locationBlockHeight;

        if (y + rowHeight > PAGE_BOTTOM) {
          doc.addPage();
          y = MARGIN;
          drawSectionHeader(y);
          y += SECTION_H + 10;
        }

        doc.rect(MARGIN, y, TABLE_W, rowHeight).fill(rowIndex % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
        doc.strokeColor('#D7DEE8').lineWidth(0.5).rect(MARGIN, y, TABLE_W, rowHeight).stroke();

        const topY = y + CELL_PADDING_Y;
        const middleY = y + topRowHeight + 2;
        const locationY = y + topRowHeight + middleRowHeight + CELL_PADDING_Y - 1;
        const rightColX = MARGIN + PRIMARY_COL_W;
        const rightCellW = SECONDARY_COL_W;
        const plumberX = rightColX + rightCellW * 2;
        const plumberW = TABLE_W - PRIMARY_COL_W - rightCellW * 2;

        doc.font('Helvetica-Bold').fillColor('#374151').text('Código', MARGIN + CELL_PADDING_X, topY, {
          width: PRIMARY_COL_W - CELL_PADDING_X * 2,
          align: 'left',
        });
        doc.font('Helvetica').fillColor('#111827').text(codeValue, MARGIN + CELL_PADDING_X, topY + LABEL_GAP, {
          width: PRIMARY_COL_W - CELL_PADDING_X * 2,
          height: topRowHeight - CELL_PADDING_Y * 2,
          align: 'left',
          lineGap: 1,
        });

        doc.font('Helvetica-Bold').fillColor('#374151').text('Fecha', rightColX + CELL_PADDING_X, topY, {
          width: rightCellW - CELL_PADDING_X * 2,
          align: 'left',
        });
        doc.font('Helvetica').fillColor('#111827').text(fit(dateValue, rightCellW - CELL_PADDING_X * 2), rightColX + CELL_PADDING_X, topY + LABEL_GAP, {
          width: rightCellW - CELL_PADDING_X * 2,
          align: 'left',
          lineBreak: false,
        });

        doc.font('Helvetica-Bold').fillColor('#374151').text('Estado', rightColX + rightCellW + CELL_PADDING_X, topY, {
          width: rightCellW - CELL_PADDING_X * 2,
          align: 'left',
        });
        doc.font('Helvetica').fillColor('#111827').text(fit(stateValue, rightCellW - CELL_PADDING_X * 2), rightColX + rightCellW + CELL_PADDING_X, topY + LABEL_GAP, {
          width: rightCellW - CELL_PADDING_X * 2,
          align: 'left',
          lineBreak: false,
        });

        doc.font('Helvetica-Bold').fillColor('#374151').text('Tipo', plumberX + CELL_PADDING_X, topY, {
          width: plumberW - CELL_PADDING_X * 2,
          align: 'left',
        });
        doc.font('Helvetica').fillColor('#111827').text(fit(typeValue, plumberW - CELL_PADDING_X * 2), plumberX + CELL_PADDING_X, topY + LABEL_GAP, {
          width: plumberW - CELL_PADDING_X * 2,
          align: 'left',
          lineBreak: false,
        });

        doc.moveTo(MARGIN, y + topRowHeight).lineTo(MARGIN + TABLE_W, y + topRowHeight).stroke('#E3E8EF');

        doc.font('Helvetica-Bold').fillColor('#374151').text('Barrio', MARGIN + CELL_PADDING_X, middleY, {
          width: PRIMARY_COL_W - CELL_PADDING_X * 2,
          align: 'left',
        });
        doc.font('Helvetica').fillColor('#111827').text(neighborhoodValue, MARGIN + CELL_PADDING_X, middleY + LABEL_GAP, {
          width: PRIMARY_COL_W - CELL_PADDING_X * 2,
          height: middleRowHeight - CELL_PADDING_Y * 2,
          align: 'left',
          lineGap: 1,
        });

        doc.font('Helvetica-Bold').fillColor('#374151').text('Fontanero', rightColX + CELL_PADDING_X, middleY, {
          width: TABLE_W - PRIMARY_COL_W - CELL_PADDING_X * 2,
          align: 'left',
        });
        doc.font('Helvetica').fillColor('#111827').text(plumberValue, rightColX + CELL_PADDING_X, middleY + LABEL_GAP, {
          width: TABLE_W - PRIMARY_COL_W - CELL_PADDING_X * 2,
          height: middleRowHeight - CELL_PADDING_Y * 2,
          align: 'left',
          lineGap: 1,
        });

        doc.moveTo(MARGIN, y + topRowHeight + middleRowHeight).lineTo(MARGIN + TABLE_W, y + topRowHeight + middleRowHeight).stroke('#E3E8EF');

        doc.font('Helvetica-Bold').fillColor('#374151').text(locationLabel, MARGIN + CELL_PADDING_X, locationY, {
          width: locationWidth,
          align: 'left',
        });
        doc.font('Helvetica').fillColor('#111827').text(locationValue, MARGIN + CELL_PADDING_X, locationY + 12, {
          width: locationWidth,
          height: locationBlockHeight - CELL_PADDING_Y * 2 - 6,
          align: 'left',
          lineGap: 1,
        });

        y += rowHeight + ROW_GAP;
      });

      // ── Gráfico de barras por ubicación ──────────────────────────────────
      y += 20;
      if (y + 220 > PAGE_BOTTOM) {
        doc.addPage();
        y = MARGIN;
      }

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Reportes por ubicación (mes seleccionado)', MARGIN, y, {
        width: TABLE_W,
        align: 'left',
      });
      doc.font('Helvetica');
      y += 24;

      if (byLocation.length === 0) {
        doc.fontSize(9).text('Sin datos para este período.', MARGIN, y);
      } else {
        const labelW  = 150;
        const valueW  = 30;
        const barMaxW = TABLE_W - labelW - valueW - 20;
        const barH    = 16;
        const rowGap  = 10;
        const maxCount = Math.max(1, ...byLocation.map((b) => b.count));

        doc.fontSize(9);
        byLocation.forEach((item) => {
          if (y + barH > PAGE_BOTTOM) {
            doc.addPage();
            y = MARGIN;
          }
          const label = fit(item.neighborhood, labelW - 8);
          doc.fillColor('#111827').text(label, MARGIN, y + 3, {
            width: labelW - 8,
            align: 'left',
            lineBreak: false,
          });

          const barW = Math.max(2, (item.count / maxCount) * barMaxW);
          doc.roundedRect(MARGIN + labelW, y, barMaxW, barH, 4).fill('#E5EDF6');
          doc.roundedRect(MARGIN + labelW, y, barW, barH, 4).fill('#4A90D9');

          doc.fillColor('#111827').text(String(item.count), MARGIN + labelW + barMaxW + 8, y + 3, {
            width: valueW,
            align: 'left',
            lineBreak: false,
          });

          y += barH + rowGap;
        });
      }

      doc.end();
    });
  }

  async buildExportExcel(year: number, month: number): Promise<Buffer> {
    const [reports, byLocation] = await Promise.all([
      this.getReportsForMonth(year, month),
      this.getMonthlyCountsByLocation({ year, month }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ASADA San Pablo Backend';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Reportes', {
      views: [{ state: 'frozen', ySplit: 4 }],
      properties: { defaultRowHeight: 22 },
    });

    const title = `Reportes - ${MONTH_NAMES[month - 1]} ${year}`;
    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value = title;
    sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: '1F2937' } };
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };

    sheet.mergeCells('A2:H2');
    sheet.getCell('A2').value = `Total de reportes: ${reports.length}`;
    sheet.getCell('A2').font = { size: 11, color: { argb: '4B5563' } };
    sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' };

    sheet.columns = [
      { header: 'Código', key: 'code', width: 24 },
      { header: 'Fecha', key: 'date', width: 14 },
      { header: 'Barrio', key: 'neighborhood', width: 24 },
      { header: 'Estado', key: 'state', width: 18 },
      { header: 'Tipo', key: 'type', width: 18 },
      { header: 'Fontanero', key: 'plumber', width: 28 },
      { header: 'Ubicación exacta', key: 'location', width: 46 },
      { header: 'Reportado por', key: 'reportedBy', width: 28 },
    ];

    const headerRow = sheet.getRow(4);
    headerRow.values = ['Código', 'Fecha', 'Barrio', 'Estado', 'Tipo', 'Fontanero', 'Ubicación exacta', 'Reportado por'];
    headerRow.height = 24;
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'D1D5DB' } },
        left: { style: 'thin', color: { argb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
        right: { style: 'thin', color: { argb: 'D1D5DB' } },
      };
    });

    reports.forEach((report, index) => {
      const row = sheet.addRow({
        code: report.Code,
        date: new Date(report.CreatedAt),
        neighborhood: report.ReportLocation?.Neighborhood ?? '-',
        state: report.ReportState,
        type: report.ReportType?.Name ?? '-',
        plumber: report.Plumber ? `${report.Plumber.Name} ${report.Plumber.Surname1}`.trim() : '-',
        location: report.ExactLocation ?? '-',
        reportedBy: report.ReportedBy
          ? `${report.ReportedBy.Name} ${report.ReportedBy.Surname1 ?? ''}`.trim()
          : '-',
      });

      row.height = 34;
      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: 'top',
          horizontal: colNumber === 2 ? 'center' : 'left',
          wrapText: colNumber === 1 || colNumber === 3 || colNumber === 6 || colNumber === 7 || colNumber === 8,
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        };
        if (index % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8FAFC' },
          };
        }
      });

      row.getCell(2).numFmt = 'dd/mm/yyyy';
    });

    sheet.autoFilter = {
      from: 'A4',
      to: 'H4',
    };

    sheet.getColumn(7).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    sheet.getColumn(1).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    sheet.getColumn(3).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    const summaryStartRow = Math.max(sheet.rowCount + 3, 8);
    sheet.mergeCells(`A${summaryStartRow}:C${summaryStartRow}`);
    sheet.getCell(`A${summaryStartRow}`).value = 'Resumen por ubicación';
    sheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 12, color: { argb: '1F2937' } };

    const summaryHeader = sheet.getRow(summaryStartRow + 1);
    summaryHeader.values = ['Ubicación', 'Cantidad'];
    summaryHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: '1F2937' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DBEAFE' },
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'BFDBFE' } },
      };
    });

    byLocation.forEach((item) => {
      sheet.addRow([item.neighborhood, item.count]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
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

  async uploadPhoto(reportId: number, photo: Express.Multer.File) {
    const report = await this.reportRepository.findOne({ where: { Id: reportId } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }
    const photoUrl = await this.uploadReportPhoto(photo, report.Code);
    report.PhotoUrl = photoUrl;
    await this.reportRepository.save(report);
    return this.loadReport(reportId);
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

    report.PlumberUserId = plumberUserId;
    report.AssignedByUserId = assignedByUserId;
    report.Instructions = instructions;

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
    } else {
      await this.reportRepository.save(report);
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
      if (!report.PlumberUserId) {
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
