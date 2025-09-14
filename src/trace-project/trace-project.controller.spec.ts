import { Test, TestingModule } from '@nestjs/testing';
import { TraceProjectController } from './trace-project.controller';
import { TraceProjectService } from './trace-project.service';

describe('TraceProjectController', () => {
  let controller: TraceProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TraceProjectController],
      providers: [TraceProjectService],
    }).compile();

    controller = module.get<TraceProjectController>(TraceProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
