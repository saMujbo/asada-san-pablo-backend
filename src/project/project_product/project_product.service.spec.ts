import { Test, TestingModule } from '@nestjs/testing';
import { ProjectProductService } from './project_product.service';

describe('ProjectProductService', () => {
  let service: ProjectProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectProductService],
    }).compile();

    service = module.get<ProjectProductService>(ProjectProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
