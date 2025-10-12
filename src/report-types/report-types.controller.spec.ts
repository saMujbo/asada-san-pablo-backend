import { Test, TestingModule } from '@nestjs/testing';
import { ReportTypesController } from './report-types.controller';
import { ReportTypesService } from './report-types.service';

describe('ReportTypesController', () => {
  let controller: ReportTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportTypesController],
      providers: [ReportTypesService],
    }).compile();

    controller = module.get<ReportTypesController>(ReportTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
