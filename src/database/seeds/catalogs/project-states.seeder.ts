import { DataSource } from 'typeorm';
import { ProjectState } from 'src/project/project-state/entities/project-state.entity';
import { syncSeedData } from '../seeder.utils';

const projectStates = [
  {
    Name: 'PENDIENTE',
    Description: 'Proyecto creado pero aun no iniciado.',
    IsActive: true,
  },
  {
    Name: 'EN PROCESO',
    Description: 'Proyecto en ejecucion.',
    IsActive: true,
  },
  {
    Name: 'FINALIZADO',
    Description: 'Proyecto concluido satisfactoriamente.',
    IsActive: true,
  },
  {
    Name: 'CANCELADO',
    Description: 'Proyecto cancelado antes de su finalizacion.',
    IsActive: true,
  },
];

export async function seedProjectStates(dataSource: DataSource) {
  return syncSeedData(dataSource.getRepository(ProjectState), 'Name', projectStates);
}
