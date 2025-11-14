import { Test, TestingModule } from '@nestjs/testing';
import { CommentChangeMeterController } from './comment-change-meter.controller';
import { CommentChangeMeterService } from './comment-change-meter.service';

describe('CommentChangeMeterController', () => {
  let controller: CommentChangeMeterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentChangeMeterController],
      providers: [CommentChangeMeterService],
    }).compile();

    controller = module.get<CommentChangeMeterController>(CommentChangeMeterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
