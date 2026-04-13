import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ name: 'table_name', type: 'varchar', length: 100 })
  tableName: string | undefined;

  @Column({ name: 'record_id', type: 'varchar', length: 191 })
  recordId: string | undefined;

  @Column({ type: 'enum', enum: ['INSERT', 'UPDATE', 'DELETE'] })
  action: AuditAction | undefined;

  @Column({ name: 'actor_user_id', type: 'int', nullable: true })
  actorUserId: number | null | undefined;

  @Column({ name: 'old_data', type: 'json', nullable: true })
  oldData: Record<string, unknown> | null | undefined;

  @Column({ name: 'new_data', type: 'json', nullable: true })
  newData: Record<string, unknown> | null | undefined;

  @Column({ name: 'changed_fields', type: 'json', nullable: true })
  changedFields: string[] | null | undefined;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date | undefined;

  @ManyToOne(() => User, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'actor_user_id', referencedColumnName: 'Id' })
  actorUser?: User | null;
}
