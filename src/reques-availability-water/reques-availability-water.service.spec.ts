import { Test, TestingModule } from '@nestjs/testing';
import { RequesAvailabilityWaterService } from './reques-availability-water.service';

describe('RequesAvailabilityWaterService', () => {
  let service: RequesAvailabilityWaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequesAvailabilityWaterService],
    }).compile();

    service = module.get<RequesAvailabilityWaterService>(RequesAvailabilityWaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
