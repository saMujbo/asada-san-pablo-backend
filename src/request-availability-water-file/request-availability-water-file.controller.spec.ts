import { Test, TestingModule } from '@nestjs/testing';
import { RequestAvailabilityWaterFileController } from './request-availability-water-file.controller';
import { RequestAvailabilityWaterFileService } from './request-availability-water-file.service';

describe('RequestAvailabilityWaterFileController', () => {
  let controller: RequestAvailabilityWaterFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestAvailabilityWaterFileController],
      providers: [RequestAvailabilityWaterFileService],
    }).compile();

    controller = module.get<RequestAvailabilityWaterFileController>(RequestAvailabilityWaterFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
