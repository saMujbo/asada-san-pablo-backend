import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Report } from './report.entity';

@Entity('report_assignments')
export class ReportAssignment {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'int', unique: true })
  ReportId: number;

  @Column({ type: 'int' })
  PlumberUserId: number;

  @Column({ type: 'int' })
  AssignedByUserId: number;

  @Column({ type: 'varchar', length: 500 })
  Instructions: string;

  @CreateDateColumn({ type: 'timestamp' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  UpdatedAt: Date;

  @OneToOne(() => Report, (report) => report.Assignment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ReportId' })
  Report: Report;

  @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'PlumberUserId' })
  Plumber: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'AssignedByUserId' })
  AssignedBy: User;
}
