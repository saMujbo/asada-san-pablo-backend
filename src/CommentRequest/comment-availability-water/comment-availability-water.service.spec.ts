import { Test, TestingModule } from '@nestjs/testing';
import { CommentAvailabilityWaterService } from './comment-availability-water.service';

describe('CommentAvailabilityWaterService', () => {
  let service: CommentAvailabilityWaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentAvailabilityWaterService],
    }).compile();

    service = module.get<CommentAvailabilityWaterService>(CommentAvailabilityWaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
