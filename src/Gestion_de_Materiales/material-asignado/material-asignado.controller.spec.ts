import { Test, TestingModule } from '@nestjs/testing';
import { MaterialAsignadoController } from './material-asignado.controller';
import { MaterialAsignadoService } from './material-asignado.service';

describe('MaterialAsignadoController', () => {
  let controller: MaterialAsignadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialAsignadoController],
      providers: [MaterialAsignadoService],
    }).compile();

    controller = module.get<MaterialAsignadoController>(MaterialAsignadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
