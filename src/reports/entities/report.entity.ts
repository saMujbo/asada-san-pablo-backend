// reports/entities/report.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { ReportLocation } from "src/report-location/entities/report-location.entity";
import { ReportType } from "src/report-types/entities/report-type.entity";

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  Location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Column({ type: 'int', nullable: false })
  UserId: number;

  @Column({ type: 'int', nullable: false })
  LocationId: number;

  @Column({ type: 'int', nullable: false })
  ReportTypeId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'UserId' })
  User: User;

  @ManyToOne(() => ReportLocation, (rl) => rl.Reports, {
    eager: true,
    onDelete: 'RESTRICT', // o 'SET NULL' si haces LocationId nullable
  })
  @JoinColumn({ name: 'LocationId' })
  ReportLocation: ReportLocation;

  @ManyToOne(() => ReportType, (rt) => rt.Reports, {
    eager: true,
    onDelete: 'RESTRICT', // o 'SET NULL' si haces ReportTypeId nullable
  })
  @JoinColumn({ name: 'ReportTypeId' })
  ReportType: ReportType;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeLocation() {
    if (this.Location) this.Location = this.Location.trim().toUpperCase();
  }
}
