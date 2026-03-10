import { DataSource } from 'typeorm';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { syncSeedData } from '../seeder.utils';

const reportTypes = [
  { Name: 'FUGA' },
  { Name: 'SIN SERVICIO' },
  { Name: 'MEDIDOR' },
  { Name: 'CALIDAD DEL AGUA' },
  { Name: 'CONEXION ILEGAL' },
  { Name: 'OTROS' },
];

export async function seedReportTypes(dataSource: DataSource) {
  return syncSeedData(dataSource.getRepository(ReportType), 'Name', reportTypes);
}
