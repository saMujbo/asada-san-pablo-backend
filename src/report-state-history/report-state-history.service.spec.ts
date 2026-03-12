import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportAssignment } from 'src/report-assignments/entities/report-assignment.entity';
import { Report } from 'src/reports/entities/report.entity';
import { ReportStateEnum } from 'src/reports/enums/report-state.enum';
import { User } from 'src/users/entities/user.entity';
import { ReportStateHistoryService } from './report-state-history.service';
import { ReportStateHistory } from './entities/report-state-history.entity';

describe('ReportStateHistoryService', () => {
  let service: ReportStateHistoryService;
  let historyRepository: any;
  let reportRepository: any;
  let usersRepository: any;
  let reportAssignmentRepository: any;

  beforeEach(async () => {
    historyRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    reportRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    usersRepository = {
      findOneOrFail: jest.fn(),
    };
    reportAssignmentRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportStateHistoryService,
        { provide: getRepositoryToken(ReportStateHistory), useValue: historyRepository },
        { provide: getRepositoryToken(Report), useValue: reportRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(ReportAssignment), useValue: reportAssignmentRepository },
      ],
    }).compile();

    service = module.get<ReportStateHistoryService>(ReportStateHistoryService);
  });

  it('stores a history entry', async () => {
    const entity = { Id: 1 };
    historyRepository.create.mockReturnValue(entity);

    await service.createHistory({
      reportId: 4,
      previousState: null,
      newState: ReportStateEnum.PENDIENTE,
      reasonChange: 'Creación',
      changedByUserId: 9,
    });

    expect(historyRepository.create).toHaveBeenCalledWith({
      ReportId: 4,
      PreviousState: null,
      NewState: ReportStateEnum.PENDIENTE,
      ReasonChange: 'Creación',
      ChangedByUserId: 9,
    });
    expect(historyRepository.save).toHaveBeenCalledWith(entity);
  });

  it('changes state when the transition is valid', async () => {
    const report = { Id: 4, ReportState: ReportStateEnum.EN_PROCESO };
    const entity = { Id: 2 };

    reportRepository.findOne.mockResolvedValue(report);
    usersRepository.findOneOrFail.mockResolvedValue({ Id: 9 });
    reportAssignmentRepository.findOne.mockResolvedValue({ Id: 1, ReportId: 4 });
    historyRepository.create.mockReturnValue(entity);

    await service.changeState(4, ReportStateEnum.RESUELTO, 'Trabajo completado', 9);

    expect(reportRepository.save).toHaveBeenCalledWith({
      Id: 4,
      ReportState: ReportStateEnum.RESUELTO,
    });
    expect(historyRepository.save).toHaveBeenCalledWith(entity);
  });

  it('throws if the report is missing', async () => {
    reportRepository.findOne.mockResolvedValue(null);

    await expect(
      service.changeState(4, ReportStateEnum.RESUELTO, 'Trabajo completado', 9),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if the transition requires an assignment and there is none', async () => {
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
});
