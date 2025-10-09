import { Test, TestingModule } from '@nestjs/testing';
import { ProjectStateService } from './project-state.service';

describe('ProjectStateService', () => {
  let service: ProjectStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectStateService],
    }).compile();

    service = module.get<ProjectStateService>(ProjectStateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
