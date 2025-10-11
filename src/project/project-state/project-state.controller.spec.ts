import { Test, TestingModule } from '@nestjs/testing';
import { ProjectStateController } from './project-state.controller';
import { ProjectStateService } from './project-state.service';

describe('ProjectStateController', () => {
  let controller: ProjectStateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectStateController],
      providers: [ProjectStateService],
    }).compile();

    controller = module.get<ProjectStateController>(ProjectStateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
