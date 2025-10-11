import {
  BeforeInsert,
  Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { ActualExpense } from 'src/actual-expense/entities/actual-expense.entity';
import { Project } from 'src/project/entities/project.entity';

@Entity({ name: 'trace_project' })
export class TraceProject {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  Name: string;

  // Sugerencia: valida en el DTO; en la entidad basta con el tipo/columna
    // @Transform(({ value }) => toDateOnly(value))
    // @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    //   message: 'date debe ser YYYY-MM-DD',
    // })
  @Column({ type: 'date', nullable: false })
  date: Date;

  @BeforeInsert()
  setTodayIfMissing() {
    if (!this.date) {
      this.date = new Date(); // TypeORM + MySQL 'date' guarda solo YYYY-MM-DD
    }
  }

  @Column()
  Observation: string;

  @Column({ default: true })
  IsActive: boolean;
 //Relations
  @OneToOne(() => ActualExpense, (actualExpense) => actualExpense.TraceProject)
  ActualExpense?: ActualExpense;

  @ManyToOne(() => Project, p => p.TraceProject, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ProjectId' })
  Project: Project;
}
