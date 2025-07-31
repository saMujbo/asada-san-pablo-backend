import { Test, TestingModule } from '@nestjs/testing';
import { MaterialAsignadoService } from './material-asignado.service';

describe('MaterialAsignadoService', () => {
  let service: MaterialAsignadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialAsignadoService],
    }).compile();

    service = module.get<MaterialAsignadoService>(MaterialAsignadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
