import { Test, TestingModule } from '@nestjs/testing';
import { ProjectFileController } from './project-file.controller';
import { ProjectFileService } from './project-file.service';

describe('ProjectFileController', () => {
  let controller: ProjectFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectFileController],
      providers: [ProjectFileService],
    }).compile();

    controller = module.get<ProjectFileController>(ProjectFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
