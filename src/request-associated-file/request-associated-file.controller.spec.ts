import { Test, TestingModule } from '@nestjs/testing';
import { RequestAssociatedFileController } from './request-associated-file.controller';
import { RequestAssociatedFileService } from './request-associated-file.service';

describe('RequestAssociatedFileController', () => {
  let controller: RequestAssociatedFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestAssociatedFileController],
      providers: [RequestAssociatedFileService],
    }).compile();

    controller = module.get<RequestAssociatedFileController>(RequestAssociatedFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
