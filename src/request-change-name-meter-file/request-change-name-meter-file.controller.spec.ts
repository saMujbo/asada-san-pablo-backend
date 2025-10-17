import { Test, TestingModule } from '@nestjs/testing';
import { RequestChangeNameMeterFileController } from './request-change-name-meter-file.controller';
import { RequestChangeNameMeterFileService } from './request-change-name-meter-file.service';

describe('RequestChangeNameMeterFileController', () => {
  let controller: RequestChangeNameMeterFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestChangeNameMeterFileController],
      providers: [RequestChangeNameMeterFileService],
    }).compile();

    controller = module.get<RequestChangeNameMeterFileController>(RequestChangeNameMeterFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
