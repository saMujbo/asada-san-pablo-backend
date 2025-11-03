import { Test, TestingModule } from '@nestjs/testing';
import { ReportStatesController } from './report-states.controller';
import { ReportStatesService } from './report-states.service';

describe('ReportStatesController', () => {
  let controller: ReportStatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportStatesController],
      providers: [ReportStatesService],
    }).compile();

    controller = module.get<ReportStatesController>(ReportStatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
