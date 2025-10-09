import { Test, TestingModule } from '@nestjs/testing';
import { RequesAvailabilityWaterController } from './reques-availability-water.controller';
import { RequesAvailabilityWaterService } from './reques-availability-water.service';

describe('RequesAvailabilityWaterController', () => {
  let controller: RequesAvailabilityWaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequesAvailabilityWaterController],
      providers: [RequesAvailabilityWaterService],
    }).compile();

    controller = module.get<RequesAvailabilityWaterController>(RequesAvailabilityWaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
