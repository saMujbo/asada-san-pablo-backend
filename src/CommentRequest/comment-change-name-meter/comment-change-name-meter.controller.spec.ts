import { Test, TestingModule } from '@nestjs/testing';
import { CommentChangeNameMeterController } from './comment-change-name-meter.controller';
import { CommentChangeNameMeterService } from './comment-change-name-meter.service';

describe('CommentChangeNameMeterController', () => {
  let controller: CommentChangeNameMeterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentChangeNameMeterController],
      providers: [CommentChangeNameMeterService],
    }).compile();

    controller = module.get<CommentChangeNameMeterController>(CommentChangeNameMeterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
