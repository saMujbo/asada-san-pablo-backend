import { Test, TestingModule } from '@nestjs/testing';
import { ProjectFileService } from './project-file.service';

describe('ProjectFileService', () => {
  let service: ProjectFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectFileService],
    }).compile();

    service = module.get<ProjectFileService>(ProjectFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
