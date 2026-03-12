import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailServiceService } from 'src/mail-service/mail-service.service';
import { ReportAssignmentsService } from 'src/report-assignments/report-assignments.service';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportStateHistoryService } from 'src/report-state-history/report-state-history.service';
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
  let reportsGateway: any;
  let mailService: any;
  let reportAssignmentsService: any;
  let reportStateHistoryService: any;

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
    reportsGateway = {
      emitReportCreated: jest.fn(),
    };
    mailService = {
      sendReportCreatedEmail: jest.fn().mockResolvedValue(undefined),
    };
    reportAssignmentsService = {
      assignPlumber: jest.fn(),
    };
    reportStateHistoryService = {
      createHistory: jest.fn(),
      changeState: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Report), useValue: reportRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(ReportLocation), useValue: reportLocationRepository },
        { provide: getRepositoryToken(ReportType), useValue: reportTypeRepository },
        { provide: ReportsGateway, useValue: reportsGateway },
        { provide: MailServiceService, useValue: mailService },
        { provide: ReportAssignmentsService, useValue: reportAssignmentsService },
        { provide: ReportStateHistoryService, useValue: reportStateHistoryService },
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
    reportLocationRepository.findOne.mockResolvedValue({ Id: 2 });
    reportTypeRepository.findOne.mockResolvedValue({ Id: 3 });
    usersRepository.findOne.mockResolvedValue({ Id: 7 });
    reportRepository.exists.mockResolvedValue(false);
    reportRepository.create.mockImplementation((value: any) => value);
    reportRepository.save.mockResolvedValue(savedReport);
    reportRepository.findOne.mockResolvedValue(loadedReport);

    const result = await service.create(dto as any, 7);

    expect(reportRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        ReportedByUserId: 7,
        ReportState: ReportStateEnum.PENDIENTE,
      }),
    );
    expect(reportStateHistoryService.createHistory).toHaveBeenCalledWith({
      reportId: 10,
      previousState: null,
      newState: ReportStateEnum.PENDIENTE,
      reasonChange: 'Creación del reporte',
      changedByUserId: 7,
    });
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
    const assignment = { ReportId: 5 };
    const loaded = { Id: 5, ReportState: ReportStateEnum.EN_PROCESO };

    reportAssignmentsService.assignPlumber.mockResolvedValue(assignment);
    reportRepository.findOne.mockResolvedValue(loaded);

    const result = await service.assignPlumber(5, 12, 'Atender hoy', 9);

    expect(reportAssignmentsService.assignPlumber).toHaveBeenCalledWith(5, 12, 'Atender hoy', 9);
    expect(result).toEqual(loaded);
  });

  it('throws when assigning a plumber to a resolved report', async () => {
    reportAssignmentsService.assignPlumber.mockRejectedValue(
      new BadRequestException('No se puede asignar un fontanero a un reporte resuelto'),
    );

    await expect(service.assignPlumber(5, 12, 'Atender hoy', 9)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('changes state when the transition is valid and there is an assignment', async () => {
    const loaded = { Id: 4, ReportState: ReportStateEnum.RESUELTO };

    reportStateHistoryService.changeState.mockResolvedValue(undefined);
    reportRepository.findOne.mockResolvedValue(loaded);

    const result = await service.changeState(
      4,
      ReportStateEnum.RESUELTO,
      'Trabajo completado',
      9,
    );

    expect(reportStateHistoryService.changeState).toHaveBeenCalledWith(
      4,
      ReportStateEnum.RESUELTO,
      'Trabajo completado',
      9,
    );
    expect(result).toEqual(loaded);
  });

  it('throws when changing state without an assignment', async () => {
    reportStateHistoryService.changeState.mockRejectedValue(
      new BadRequestException('El reporte debe tener un fontanero asignado antes de pasar a "En Proceso"'),
    );

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
