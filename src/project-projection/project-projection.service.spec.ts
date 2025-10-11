import { Test, TestingModule } from '@nestjs/testing';
import { ProjectProjectionService } from './project-projection.service';

describe('ProjectProjectionService', () => {
  let service: ProjectProjectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectProjectionService],
    }).compile();

    service = module.get<ProjectProjectionService>(ProjectProjectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
