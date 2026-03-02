// reports/entities/report.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { ReportLocation } from "src/report-location/entities/report-location.entity";
import { ReportType } from "src/report-types/entities/report-type.entity";
import { ReportState } from "src/report-states/entities/report-state.entity";

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  Id: number;

  /** Código del reporte: RPT-yyyymmdd-001 (siglas + fecha + secuencia diaria) */
  @Column({ type: 'varchar', length: 30, nullable: true })
  Code: string;

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

  @Column({ type: 'int', nullable: true, default: null })
  ReportStateId: number;

  @Column({ type: 'int', nullable: true, default: null })
  UserInChargeId: number;

  @Column({type: 'varchar', length: 255, nullable: true})
  AdditionalInfo: string;

  // relacion con el usuario que crea el reporte
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'UserId' })
  User: User;

  // relación con el usuario encargado del reporte
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'UserInChargeId' })
  UserInCharge: User;

  // Relación con ReportLocation
  @ManyToOne(() => ReportLocation, (rl) => rl.Reports, {
    eager: true,
    onDelete: 'RESTRICT', 
  })
  @JoinColumn({ name: 'LocationId' })
  ReportLocation: ReportLocation;

  // Relación con ReportType
  @ManyToOne(() => ReportType, (rt) => rt.Reports, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ReportTypeId' })
  ReportType: ReportType;

  // Relación con ReportState
  @ManyToOne(() => ReportState, (reportStates) => reportStates.Reports, {
    eager: true,
    nullable: true,
    onDelete: 'RESTRICT', 
  })
  @JoinColumn({ name: 'ReportStateId' })
  ReportState: ReportState;

}
  