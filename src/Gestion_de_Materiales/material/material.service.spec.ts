import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsService } from './material.service';

describe('MaterialService', () => {
  let service: MaterialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialsService],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
