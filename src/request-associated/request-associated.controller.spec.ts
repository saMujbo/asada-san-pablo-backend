import { Test, TestingModule } from '@nestjs/testing';
import { RequestAssociatedController } from './request-associated.controller';
import { RequestAssociatedService } from './request-associated.service';

describe('RequestAssociatedController', () => {
  let controller: RequestAssociatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestAssociatedController],
      providers: [RequestAssociatedService],
    }).compile();

    controller = module.get<RequestAssociatedController>(RequestAssociatedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
