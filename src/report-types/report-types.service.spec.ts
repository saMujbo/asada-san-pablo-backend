import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportTypesService } from './report-types.service';
import { ReportType } from './entities/report-type.entity';

describe('ReportTypesService', () => {
  let service: ReportTypesService;
  let reportTypeRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    reportTypeRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportTypesService,
        {
          provide: getRepositoryToken(ReportType),
          useValue: reportTypeRepository,
        },
      ],
    }).compile();

    service = module.get<ReportTypesService>(ReportTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a report type in uppercase', async () => {
    const dto = { Name: 'Fuga' };
    const created = { Id: 1, Name: 'FUGA' };

    reportTypeRepository.findOne.mockResolvedValue(null);
    reportTypeRepository.create.mockReturnValue(created);
    reportTypeRepository.save.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(reportTypeRepository.create).toHaveBeenCalledWith({ Name: 'FUGA' });
    expect(reportTypeRepository.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('throws when the report type already exists', async () => {
    reportTypeRepository.findOne.mockResolvedValue({ Id: 1, Name: 'FUGA' });

    await expect(service.create({ Name: 'Fuga' })).rejects.toThrow(
      'El tipo de reporte ya existe',
    );
  });

  it('returns all report types', async () => {
    const rows = [{ Id: 1, Name: 'FUGA' }];
    reportTypeRepository.find.mockResolvedValue(rows);

    await expect(service.findAll()).resolves.toEqual(rows);
  });
});
