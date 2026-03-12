import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportStateHistoryService } from 'src/report-state-history/report-state-history.service';
import { Report } from 'src/reports/entities/report.entity';
import { ReportStateEnum } from 'src/reports/enums/report-state.enum';
import { User } from 'src/users/entities/user.entity';
import { ReportAssignmentsService } from './report-assignments.service';
import { ReportAssignment } from './entities/report-assignment.entity';

describe('ReportAssignmentsService', () => {
  let service: ReportAssignmentsService;
  let reportAssignmentRepository: any;
  let reportRepository: any;
  let usersRepository: any;
  let reportStateHistoryService: any;

  beforeEach(async () => {
    reportAssignmentRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    reportRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    usersRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
    };
    reportStateHistoryService = {
      createHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportAssignmentsService,
        { provide: getRepositoryToken(ReportAssignment), useValue: reportAssignmentRepository },
        { provide: getRepositoryToken(Report), useValue: reportRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: ReportStateHistoryService, useValue: reportStateHistoryService },
      ],
    }).compile();

    service = module.get<ReportAssignmentsService>(ReportAssignmentsService);
  });

  it('creates or updates the assignment and moves a pending report to in process', async () => {
    const report = { Id: 5, ReportState: ReportStateEnum.PENDIENTE };
    const assignment = { ReportId: 5 };

    reportRepository.findOne.mockResolvedValue(report);
    usersRepository.findOneOrFail.mockResolvedValue({ Id: 9 });
    usersRepository.findOne.mockResolvedValue({ Id: 12, Roles: [{ Rolname: 'FONTANERO' }] });
    reportAssignmentRepository.findOne.mockResolvedValue(null);
    reportAssignmentRepository.create.mockReturnValue(assignment);

    await service.assignPlumber(5, 12, 'Atender hoy', 9);

    expect(reportAssignmentRepository.save).toHaveBeenCalledWith({
      ReportId: 5,
      PlumberUserId: 12,
      AssignedByUserId: 9,
      Instructions: 'Atender hoy',
    });
    expect(reportRepository.save).toHaveBeenCalledWith({
      Id: 5,
      ReportState: ReportStateEnum.EN_PROCESO,
    });
    expect(reportStateHistoryService.createHistory).toHaveBeenCalledWith({
      reportId: 5,
      previousState: ReportStateEnum.PENDIENTE,
      newState: ReportStateEnum.EN_PROCESO,
      reasonChange: 'Asignación de fontanero responsable',
      changedByUserId: 9,
    });
  });

  it('throws if the report does not exist', async () => {
    reportRepository.findOne.mockResolvedValue(null);

    await expect(service.assignPlumber(5, 12, 'Atender hoy', 9)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if the report is resolved', async () => {
    reportRepository.findOne.mockResolvedValue({
      Id: 5,
      ReportState: ReportStateEnum.RESUELTO,
    });

    await expect(service.assignPlumber(5, 12, 'Atender hoy', 9)).rejects.toThrow(
      BadRequestException,
    );
  });
});
