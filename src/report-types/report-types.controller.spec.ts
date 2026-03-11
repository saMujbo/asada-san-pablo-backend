import { Test, TestingModule } from '@nestjs/testing';
import { ReportTypesController } from './report-types.controller';
import { ReportTypesService } from './report-types.service';

describe('ReportTypesController', () => {
  let controller: ReportTypesController;
  const reportTypesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportTypesController],
      providers: [
        {
          provide: ReportTypesService,
          useValue: reportTypesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ReportTypesController>(ReportTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to the service', async () => {
    const dto = { Name: 'FUGA' };
    reportTypesServiceMock.create.mockResolvedValue(dto);

    await expect(controller.create(dto as any)).resolves.toEqual(dto);
    expect(reportTypesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll to the service', async () => {
    reportTypesServiceMock.findAll.mockResolvedValue([{ Id: 1 }]);

    await expect(controller.findAll()).resolves.toEqual([{ Id: 1 }]);
  });
});
