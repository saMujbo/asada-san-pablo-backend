import { Test, TestingModule } from '@nestjs/testing';
import { ReportStatesController } from './report-states.controller';
import { ReportStatesService } from './report-states.service';

describe('ReportStatesController', () => {
  let controller: ReportStatesController;
  const reportStatesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    countReportsInProcess: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportStatesController],
      providers: [
        {
          provide: ReportStatesService,
          useValue: reportStatesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ReportStatesController>(ReportStatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findAll to the service', async () => {
    reportStatesServiceMock.findAll.mockResolvedValue([{ Id: 1 }]);

    await expect(controller.findAll()).resolves.toEqual([{ Id: 1 }]);
  });

  it('returns the count of reports in process', async () => {
    reportStatesServiceMock.countReportsInProcess.mockResolvedValue(7);

    await expect(controller.countEnProceso()).resolves.toEqual({
      totalReportsInProcess: 7,
    });
  });
});
