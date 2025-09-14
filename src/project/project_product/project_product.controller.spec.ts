import { Test, TestingModule } from '@nestjs/testing';
import { ProjectProductController } from './project_product.controller';
import { ProjectProductService } from './project_product.service';

describe('ProjectProductController', () => {
  let controller: ProjectProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectProductController],
      providers: [ProjectProductService],
    }).compile();

    controller = module.get<ProjectProductController>(ProjectProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
