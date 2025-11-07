import { Test, TestingModule } from '@nestjs/testing';
import { CommentSupervisionMeterController } from './comment-supervision-meter.controller';
import { CommentSupervisionMeterService } from './comment-supervision-meter.service';

describe('CommentSupervisionMeterController', () => {
  let controller: CommentSupervisionMeterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentSupervisionMeterController],
      providers: [CommentSupervisionMeterService],
    }).compile();

    controller = module.get<CommentSupervisionMeterController>(CommentSupervisionMeterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
