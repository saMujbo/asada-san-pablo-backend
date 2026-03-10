import { DataSource } from 'typeorm';
import { StateRequest } from 'src/state-request/entities/state-request.entity';
import { syncSeedData } from '../seeder.utils';

const requestStates = [
  {
    Name: 'PENDIENTE',
    Description: 'Solicitud recibida y pendiente de revision.',
    IsActive: true,
  },
  {
    Name: 'EN REVISION',
    Description: 'Solicitud en proceso de analisis administrativo.',
    IsActive: true,
  },
  {
    Name: 'APROBADA',
    Description: 'Solicitud aprobada por la ASADA.',
    IsActive: true,
  },
  {
    Name: 'RECHAZADA',
    Description: 'Solicitud rechazada por incumplimiento o resolucion administrativa.',
    IsActive: true,
  },
];

export async function seedStateRequests(dataSource: DataSource) {
  return syncSeedData(dataSource.getRepository(StateRequest), 'Name', requestStates);
}
