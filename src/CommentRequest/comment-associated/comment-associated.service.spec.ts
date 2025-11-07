import { Test, TestingModule } from '@nestjs/testing';
import { CommentAssociatedService } from './comment-associated.service';

describe('CommentAssociatedService', () => {
  let service: CommentAssociatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentAssociatedService],
    }).compile();

    service = module.get<CommentAssociatedService>(CommentAssociatedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
