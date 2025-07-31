import { Test, TestingModule } from '@nestjs/testing';
import { ProyectosService } from './proyecto.service';

describe('ProyectoService', () => {
  let service: ProyectosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProyectosService],
    }).compile();

    service = module.get<ProyectosService>(ProyectosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
