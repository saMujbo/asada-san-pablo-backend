import { Report } from "src/reports/entities/report.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('report_types')
export class ReportType {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  Name: string;

  @OneToMany(() => Report, (report) => report.ReportType)
  Reports: Report[];
}


