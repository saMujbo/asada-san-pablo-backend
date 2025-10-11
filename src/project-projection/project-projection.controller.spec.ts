import { Test, TestingModule } from '@nestjs/testing';
import { ProjectProjectionController } from './project-projection.controller';
import { ProjectProjectionService } from './project-projection.service';

describe('ProjectProjectionController', () => {
  let controller: ProjectProjectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectProjectionController],
      providers: [ProjectProjectionService],
    }).compile();

    controller = module.get<ProjectProjectionController>(ProjectProjectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
