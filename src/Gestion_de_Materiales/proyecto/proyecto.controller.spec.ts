import { Test, TestingModule } from '@nestjs/testing';
import { ProyectosController } from './proyecto.controller';
import { ProyectosService } from './proyecto.service';

describe('ProyectoController', () => {
  let controller: ProyectosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProyectosController],
      providers: [ProyectosService],
    }).compile();

    controller = module.get<ProyectosController>(ProyectosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
