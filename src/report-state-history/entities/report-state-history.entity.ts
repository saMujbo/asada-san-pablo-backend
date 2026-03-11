import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Report } from 'src/reports/entities/report.entity';
import { ReportStateEnum } from 'src/reports/enums/report-state.enum';

@Entity('report_state_history')
export class ReportStateHistory {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'int' })
  ReportId: number;

  @Column({
    type: 'enum',
    enum: ReportStateEnum,
    nullable: true,
  })
  PreviousState: ReportStateEnum | null;

  @Column({
    type: 'enum',
    enum: ReportStateEnum,
  })
  NewState: ReportStateEnum;

  @Column({ type: 'varchar', length: 500 })
  ReasonChange: string;

  @Column({ type: 'int' })
  ChangedByUserId: number;

  @CreateDateColumn({ type: 'timestamp' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  UpdatedAt: Date;

  @ManyToOne(() => Report, (report) => report.StateHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ReportId' })
  Report: Report;

  @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ChangedByUserId' })
  ChangedBy: User;
}
