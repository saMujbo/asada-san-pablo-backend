import { Test, TestingModule } from '@nestjs/testing';
import { RequestChangeMeterController } from './request-change-meter.controller';
import { RequestChangeMeterService } from './request-change-meter.service';

describe('RequestChangeMeterController', () => {
  let controller: RequestChangeMeterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestChangeMeterController],
      providers: [RequestChangeMeterService],
    }).compile();

    controller = module.get<RequestChangeMeterController>(RequestChangeMeterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
