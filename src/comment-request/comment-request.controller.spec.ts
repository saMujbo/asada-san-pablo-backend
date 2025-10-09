import { Test, TestingModule } from '@nestjs/testing';
import { CommentRequestController } from './comment-request.controller';
import { CommentRequestService } from './comment-request.service';

describe('CommentRequestController', () => {
  let controller: CommentRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentRequestController],
      providers: [CommentRequestService],
    }).compile();

    controller = module.get<CommentRequestController>(CommentRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
