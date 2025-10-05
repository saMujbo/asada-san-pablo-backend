import { Test, TestingModule } from '@nestjs/testing';
import { CommentRequestService } from './comment-request.service';

describe('CommentRequestService', () => {
  let service: CommentRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentRequestService],
    }).compile();

    service = module.get<CommentRequestService>(CommentRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
