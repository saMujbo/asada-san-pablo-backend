import { Test, TestingModule } from '@nestjs/testing';
import { CommentAssociatedController } from './comment-associated.controller';
import { CommentAssociatedService } from './comment-associated.service';

describe('CommentAssociatedController', () => {
  let controller: CommentAssociatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentAssociatedController],
      providers: [CommentAssociatedService],
    }).compile();

    controller = module.get<CommentAssociatedController>(CommentAssociatedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
