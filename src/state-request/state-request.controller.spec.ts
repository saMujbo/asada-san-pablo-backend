import { Test, TestingModule } from '@nestjs/testing';
import { StateRequestController } from './state-request.controller';
import { StateRequestService } from './state-request.service';

describe('StateRequestController', () => {
  let controller: StateRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateRequestController],
      providers: [StateRequestService],
    }).compile();

    controller = module.get<StateRequestController>(StateRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
