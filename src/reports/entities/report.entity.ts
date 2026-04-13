import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from 'src/users/entities/user.entity';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { ReportStateHistory } from './report-state-history.entity';
import { ReportStateEnum } from '../enums/report-state.enum';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 40, unique: true })
  Code: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  ExactLocation: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  Description: string;

  @CreateDateColumn({ type: 'timestamp' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  UpdatedAt: Date;

  @Column({ type: 'int', nullable: false })
  ReportLocationId: number;

  @Column({ type: 'int', nullable: false })
  ReportTypeId: number;

  @Column({ type: 'int', nullable: false })
  ReportedByUserId: number;

  @Column({
    type: 'enum',
    enum: ReportStateEnum,
    default: ReportStateEnum.PENDIENTE,
  })
  ReportState: ReportStateEnum;

  @Column({ type: 'int', nullable: true, default: null })
  PlumberUserId: number | null;

  @Column({ type: 'int', nullable: true, default: null })
  AssignedByUserId: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  Instructions: string | null;

  // ── Foto del reporte (URL en Dropbox) ──
  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  PhotoUrl: string | null;

  // ── Relaciones ──
  @ManyToOne(() => ReportLocation, (rl) => rl.Reports, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ReportLocationId' })
  ReportLocation: ReportLocation;

  @ManyToOne(() => ReportType, (rt) => rt.Reports, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ReportTypeId' })
  ReportType: ReportType;

  @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ReportedByUserId' })
  ReportedBy: User;

  @ManyToOne(() => User, { nullable: true, eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'PlumberUserId' })
  Plumber: User | null;

  @ManyToOne(() => User, { nullable: true, eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'AssignedByUserId' })
  AssignedBy: User | null;

  @OneToMany(() => ReportStateHistory, (history) => history.Report)
  StateHistory: ReportStateHistory[];

  @BeforeInsert()
  @BeforeUpdate()
  ensureCode() {
    if (typeof this.Code === 'string' && this.Code.trim()) {
      this.Code = this.Code.trim();
      return;
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const suffix = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
    this.Code = `RPT-${yyyy}${mm}${dd}-${suffix}`;
  }
}
