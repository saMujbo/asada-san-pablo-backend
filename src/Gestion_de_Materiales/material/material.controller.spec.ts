import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './material.controller';
import { MaterialsService } from './material.service';

describe('MaterialController', () => {
  let controller: MaterialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [MaterialsService],
    }).compile();

    controller = module.get<MaterialsController>(MaterialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
