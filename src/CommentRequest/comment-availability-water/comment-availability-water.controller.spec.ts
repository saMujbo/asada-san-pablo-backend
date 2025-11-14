import { Test, TestingModule } from '@nestjs/testing';
import { CommentAvailabilityWaterController } from './comment-availability-water.controller';
import { CommentAvailabilityWaterService } from './comment-availability-water.service';

describe('CommentAvailabilityWaterController', () => {
  let controller: CommentAvailabilityWaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentAvailabilityWaterController],
      providers: [CommentAvailabilityWaterService],
    }).compile();

    controller = module.get<CommentAvailabilityWaterController>(CommentAvailabilityWaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
