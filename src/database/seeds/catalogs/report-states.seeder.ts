import { DataSource } from 'typeorm';
import { ReportState } from 'src/report-states/entities/report-state.entity';
import { ReportStateEnum } from 'src/reports/enums/report-state.enum';
import { syncSeedData } from '../seeder.utils';

const reportStates = [
  { Name: ReportStateEnum.PENDIENTE, IsActive: true },
  { Name: ReportStateEnum.EN_PROCESO, IsActive: true },
  { Name: ReportStateEnum.RESUELTO, IsActive: true },
];

export async function seedReportStates(dataSource: DataSource) {
  return syncSeedData(dataSource.getRepository(ReportState), 'Name', reportStates);
}
