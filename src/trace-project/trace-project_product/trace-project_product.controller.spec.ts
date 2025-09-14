import { Test, TestingModule } from '@nestjs/testing';
import { TraceProjectProductController } from './trace-project_product.controller';
import { TraceProjectProductService } from './trace-project_product.service';

describe('TraceProjectProductController', () => {
  let controller: TraceProjectProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TraceProjectProductController],
      providers: [TraceProjectProductService],
    }).compile();

    controller = module.get<TraceProjectProductController>(TraceProjectProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
