// report-location/entities/report-location.entity.ts
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Report } from "src/reports/entities/report.entity";

@Entity('report_locations')
export class ReportLocation {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  Neighborhood: string;

  // 👇 inverso correcto: propiedad de navegación en Report
  @OneToMany(() => Report, (report) => report.ReportLocation)
  Reports: Report[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeNeighborhood() {
    if (this.Neighborhood) this.Neighborhood = this.Neighborhood.trim().toUpperCase();
  }
}
