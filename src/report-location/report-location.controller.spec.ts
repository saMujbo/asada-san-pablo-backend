import { Test, TestingModule } from '@nestjs/testing';
import { ReportLocationController } from './report-location.controller';
import { ReportLocationService } from './report-location.service';

describe('ReportLocationController', () => {
  let controller: ReportLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportLocationController],
      providers: [ReportLocationService],
    }).compile();

    controller = module.get<ReportLocationController>(ReportLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
