import { Test, TestingModule } from '@nestjs/testing';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { ReportStateEnum } from './enums/report-state.enum';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  const reportsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    buildExportPdf: jest.fn(),
    buildExportExcel: jest.fn(),
    getMonthlyCounts: jest.fn(),
    getMonthlyCountsByLocation: jest.fn(),
    getMyReportsSummary: jest.fn(),
    countByStateNameForUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    assignPlumber: jest.fn(),
    changeState: jest.fn(),
    remove: jest.fn(),
  };
  const guardMock = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: reportsServiceMock,
        },
      ],
    })
      .overrideGuard(TokenGuard)
      .useValue(guardMock)
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to the service', async () => {
    const dto = { Description: 'Fuga' };
    const created = { Id: 1 };
    reportsServiceMock.create.mockResolvedValue(created);

    await expect(controller.create(dto as any)).resolves.toEqual(created);
    expect(reportsServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll to the service', async () => {
    const pagination = { page: 1, limit: 10 };
    reportsServiceMock.findAll.mockResolvedValue({ data: [], meta: {} });

    await controller.findAll(pagination as any);

    expect(reportsServiceMock.findAll).toHaveBeenCalledWith(pagination);
  });

  it('delegates findByUserId to the service', async () => {
    const reports = [{ Id: 1, ReportedByUserId: 8 }];
    reportsServiceMock.findByUserId.mockResolvedValue(reports);

    await expect(controller.findByUserId('8')).resolves.toEqual(reports);
    expect(reportsServiceMock.findByUserId).toHaveBeenCalledWith(8);
  });

  it('returns 400 when exportPdf receives an invalid year', async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.exportPdf('1999', '3', res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(reportsServiceMock.buildExportPdf).not.toHaveBeenCalled();
  });

  it('builds the pdf and sends it with the right headers', async () => {
    const pdf = Buffer.from('pdf');
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    reportsServiceMock.buildExportPdf.mockResolvedValue(pdf);

    await controller.exportPdf('2026', '3', res as any);

    expect(reportsServiceMock.buildExportPdf).toHaveBeenCalledWith(2026, 3);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="reportes-Marzo-2026.pdf"',
    );
    expect(res.send).toHaveBeenCalledWith(pdf);
  });

  it('builds the excel and sends it with the right headers', async () => {
    const excel = Buffer.from('excel');
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    reportsServiceMock.buildExportExcel.mockResolvedValue(excel);

    await controller.exportExcel('2026', '3', res as any);

    expect(reportsServiceMock.buildExportExcel).toHaveBeenCalledWith(2026, 3);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="reportes-Marzo-2026.xlsx"',
    );
    expect(res.send).toHaveBeenCalledWith(excel);
  });

  it('parses monthly stats query params', async () => {
    await controller.getMonthly('6', ReportStateEnum.PENDIENTE, '2', '4');

    expect(reportsServiceMock.getMonthlyCounts).toHaveBeenCalledWith({
      months: 6,
      state: ReportStateEnum.PENDIENTE,
      reportLocationId: 2,
      reportTypeId: 4,
    });
  });

  it('returns the state count for the current user', async () => {
    reportsServiceMock.countByStateNameForUser.mockResolvedValue(5);

    await expect(
      controller.getMyReportsCountByState(8, ReportStateEnum.EN_PROCESO),
    ).resolves.toEqual({
      state: ReportStateEnum.EN_PROCESO,
      count: 5,
    });
  });

  it('delegates assignPlumber to the service', async () => {
    const dto = { plumberUserId: 12, instructions: 'Ir hoy' };

    await controller.assignPlumber('7', dto as any, 3);

    expect(reportsServiceMock.assignPlumber).toHaveBeenCalledWith(7, 12, 'Ir hoy', 3);
  });

  it('delegates changeState to the service', async () => {
    const dto = {
      newState: ReportStateEnum.RESUELTO,
      reasonChange: 'Trabajo finalizado',
    };

    await controller.changeState('7', dto as any, 3);

    expect(reportsServiceMock.changeState).toHaveBeenCalledWith(
      7,
      ReportStateEnum.RESUELTO,
      'Trabajo finalizado',
      3,
    );
  });
});
