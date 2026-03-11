import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from 'src/reports/reports.service';
import { ReportStateEnum } from 'src/reports/enums/report-state.enum';
import { ReportStatesService } from './report-states.service';
import { ReportState } from './entities/report-state.entity';

describe('ReportStatesService', () => {
  let service: ReportStatesService;
  let reportStateRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };
  let reportsService: {
    countByState: jest.Mock;
  };

  beforeEach(async () => {
    reportStateRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    reportsService = {
      countByState: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportStatesService,
        {
          provide: getRepositoryToken(ReportState),
          useValue: reportStateRepository,
        },
        {
          provide: ReportsService,
          useValue: reportsService,
        },
      ],
    }).compile();

    service = module.get<ReportStatesService>(ReportStatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a new report state', async () => {
    const dto = { Name: 'Pendiente' };
    const created = { Id: 1, ...dto };

    reportStateRepository.findOne.mockResolvedValue(null);
    reportStateRepository.create.mockReturnValue(created);
    reportStateRepository.save.mockResolvedValue(created);

    await expect(service.create(dto as any)).resolves.toEqual(created);
    expect(reportStateRepository.create).toHaveBeenCalledWith(dto);
  });

  it('throws when the report state already exists', async () => {
    reportStateRepository.findOne.mockResolvedValue({ Id: 1, Name: 'Pendiente' });

    await expect(service.create({ Name: 'Pendiente' } as any)).rejects.toThrow(
      'El estado del reporte ya existe',
    );
  });

  it('returns reports in process count', async () => {
    reportsService.countByState.mockResolvedValue(4);

    await expect(service.countReportsInProcess()).resolves.toBe(4);
    expect(reportsService.countByState).toHaveBeenCalledWith(
      ReportStateEnum.EN_PROCESO,
    );
  });
});
