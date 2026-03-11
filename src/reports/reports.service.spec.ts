import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailServiceService } from 'src/mail-service/mail-service.service';
import { ReportAssignment } from 'src/report-assignments/entities/report-assignment.entity';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportStateHistory } from 'src/report-state-history/entities/report-state-history.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportsGateway } from './reports.gateway';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';
import { ReportStateEnum } from './enums/report-state.enum';

describe('ReportsService', () => {
  let service: ReportsService;
  let reportRepository: any;
  let usersRepository: any;
  let reportLocationRepository: any;
  let reportTypeRepository: any;
  let reportAssignmentRepository: any;
  let reportStateHistoryRepository: any;
  let reportsGateway: any;
  let mailService: any;

  beforeEach(async () => {
    reportRepository = {
      findOne: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    usersRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
    };
    reportLocationRepository = {
      findOne: jest.fn(),
    };
    reportTypeRepository = {
      findOne: jest.fn(),
    };
    reportAssignmentRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    reportStateHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    reportsGateway = {
      emitReportCreated: jest.fn(),
    };
    mailService = {
      sendReportCreatedEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Report), useValue: reportRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(ReportLocation), useValue: reportLocationRepository },
        { provide: getRepositoryToken(ReportType), useValue: reportTypeRepository },
        { provide: getRepositoryToken(ReportAssignment), useValue: reportAssignmentRepository },
        { provide: getRepositoryToken(ReportStateHistory), useValue: reportStateHistoryRepository },
        { provide: ReportsGateway, useValue: reportsGateway },
        { provide: MailServiceService, useValue: mailService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a report, stores history, emits the socket event and queues the email', async () => {
    const dto = {
      ReportLocationId: 2,
      ReportTypeId: 3,
      ExactLocation: 'Frente a la escuela',
      Description: 'Fuga de agua',
    };
    const savedReport = { Id: 10, ...dto, ReportedByUserId: 7, ReportState: ReportStateEnum.PENDIENTE };
    const loadedReport = {
      ...savedReport,
      Code: 'RPT-20260311-ABC123',
      CreatedAt: new Date('2026-03-11T12:00:00.000Z'),
      ReportLocation: { Id: 2, Neighborhood: 'Centro' },
      ReportType: { Id: 3, Name: 'FUGA' },
      ReportedBy: {
        Id: 7,
        Name: 'Ana',
        Surname1: 'Perez',
        Surname2: 'Lopez',
        Email: 'ana@example.com',
      },
      Assignment: null,
      StateHistory: [],
    };
    const historyEntity = { Id: 1 };

    reportLocationRepository.findOne.mockResolvedValue({ Id: 2 });
    reportTypeRepository.findOne.mockResolvedValue({ Id: 3 });
    usersRepository.findOne.mockResolvedValue({ Id: 7 });
    reportRepository.exists.mockResolvedValue(false);
    reportRepository.create.mockImplementation((value: any) => value);
    reportRepository.save.mockResolvedValue(savedReport);
    reportStateHistoryRepository.create.mockReturnValue(historyEntity);
    reportRepository.findOne.mockResolvedValue(loadedReport);

    const result = await service.create(dto as any, 7);

    expect(reportRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        ReportedByUserId: 7,
        ReportState: ReportStateEnum.PENDIENTE,
      }),
    );
    expect(reportStateHistoryRepository.create).toHaveBeenCalledWith({
      ReportId: 10,
      PreviousState: null,
      NewState: ReportStateEnum.PENDIENTE,
      ReasonChange: 'Creación del reporte',
      ChangedByUserId: 7,
    });
    expect(reportStateHistoryRepository.save).toHaveBeenCalledWith(historyEntity);
    expect(reportsGateway.emitReportCreated).toHaveBeenCalled();
    expect(mailService.sendReportCreatedEmail).toHaveBeenCalled();
    expect(result).toEqual(loadedReport);
  });

  it('throws when creating a report with an invalid location', async () => {
    reportLocationRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        { ReportLocationId: 99, ReportTypeId: 3, ExactLocation: 'x', Description: 'y' } as any,
        7,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns paginated reports from findAll', async () => {
    const data = [{ Id: 1 }];
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, 1]),
    };
    reportRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findAll({
      page: 1,
      limit: 10,
      state: ReportStateEnum.PENDIENTE,
      reportLocationId: 2,
      q: 'fuga',
    } as any);

    expect(qb.andWhere).toHaveBeenCalled();
    expect(result.data).toEqual(data);
    expect(result.meta.totalItems).toBe(1);
  });

  it('assigns a plumber and moves a pending report to in process', async () => {
    const report = { Id: 5, ReportState: ReportStateEnum.PENDIENTE };
    const assignment = { ReportId: 5 };
    const loaded = { Id: 5, ReportState: ReportStateEnum.EN_PROCESO };
    const historyEntity = { Id: 20 };

    reportRepository.findOne
      .mockResolvedValueOnce(report)
      .mockResolvedValueOnce(loaded);
    usersRepository.findOneOrFail.mockResolvedValue({ Id: 9 });
    usersRepository.findOne.mockResolvedValue({
      Id: 12,
      Roles: [{ Rolname: 'FONTANERO' }],
    });
    reportAssignmentRepository.findOne.mockResolvedValue(null);
    reportAssignmentRepository.create.mockReturnValue(assignment);
    reportStateHistoryRepository.create.mockReturnValue(historyEntity);

    const result = await service.assignPlumber(5, 12, 'Atender hoy', 9);

    expect(reportAssignmentRepository.save).toHaveBeenCalledWith({
      ReportId: 5,
      PlumberUserId: 12,
      AssignedByUserId: 9,
      Instructions: 'Atender hoy',
    });
    expect(report.ReportState).toBe(ReportStateEnum.EN_PROCESO);
    expect(reportRepository.save).toHaveBeenCalledWith(report);
    expect(reportStateHistoryRepository.save).toHaveBeenCalledWith(historyEntity);
    expect(result).toEqual(loaded);
  });

  it('throws when assigning a plumber to a resolved report', async () => {
    reportRepository.findOne.mockResolvedValue({
      Id: 5,
      ReportState: ReportStateEnum.RESUELTO,
    });

    await expect(service.assignPlumber(5, 12, 'Atender hoy', 9)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('changes state when the transition is valid and there is an assignment', async () => {
    const report = { Id: 4, ReportState: ReportStateEnum.EN_PROCESO };
    const loaded = { Id: 4, ReportState: ReportStateEnum.RESUELTO };
    const historyEntity = { Id: 30 };

    reportRepository.findOne
      .mockResolvedValueOnce(report)
      .mockResolvedValueOnce(loaded);
    usersRepository.findOneOrFail.mockResolvedValue({ Id: 9 });
    reportAssignmentRepository.findOne.mockResolvedValue({ Id: 1, ReportId: 4 });
    reportStateHistoryRepository.create.mockReturnValue(historyEntity);

    const result = await service.changeState(
      4,
      ReportStateEnum.RESUELTO,
      'Trabajo completado',
      9,
    );

    expect(reportRepository.save).toHaveBeenCalledWith({
      Id: 4,
      ReportState: ReportStateEnum.RESUELTO,
    });
    expect(reportStateHistoryRepository.save).toHaveBeenCalledWith(historyEntity);
    expect(result).toEqual(loaded);
  });

  it('throws when changing state without an assignment', async () => {
    reportRepository.findOne.mockResolvedValue({
      Id: 4,
      ReportState: ReportStateEnum.PENDIENTE,
    });
    usersRepository.findOneOrFail.mockResolvedValue({ Id: 9 });
    reportAssignmentRepository.findOne.mockResolvedValue(null);

    await expect(
      service.changeState(4, ReportStateEnum.EN_PROCESO, 'Iniciar trabajo', 9),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when the requested state name is invalid', async () => {
    await expect(service.countByStateNameForUser(2, 'cerrado')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('removes an existing report', async () => {
    reportRepository.findOne.mockResolvedValue({ Id: 11 });
    reportRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(11)).resolves.toEqual({
      message: 'Reporte eliminado correctamente',
    });
  });

  it('throws when removing a missing report', async () => {
    reportRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(11)).rejects.toThrow(NotFoundException);
  });
});
