import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { ReportAssignment } from './report-assignment.entity';
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

  @OneToOne(() => ReportAssignment, (assignment) => assignment.Report)
  Assignment: ReportAssignment | null;

  @OneToMany(() => ReportStateHistory, (history) => history.Report)
  StateHistory: ReportStateHistory[];
}
