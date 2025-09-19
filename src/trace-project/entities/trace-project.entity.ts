import {
  Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { ActualExpense } from 'src/actual-expense/entities/actual-expense.entity';
import { Transform } from 'class-transformer';
import { toDateOnly } from 'src/utils/ToDateOnly';
import { Matches } from 'class-validator';

@Entity({ name: 'trace_project' })
export class TraceProject {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  Name: string;

  // Sugerencia: valida en el DTO; en la entidad basta con el tipo/columna
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'date debe ser YYYY-MM-DD',
    })
    date: string;
  @Column()
  Observation: string;

  @Column({ default: true })
  IsActive: boolean;

  @ManyToMany(() => ActualExpense, (ae) => ae.TraceProjects)
  @JoinTable({
    name: 'trace_project_actual_expense',                 // nombre de la tabla puente
    joinColumn: { name: 'TraceProjectId', referencedColumnName: 'Id' },
    inverseJoinColumn: { name: 'ActualExpenseId', referencedColumnName: 'Id' },
  })
  ActualExpenses: ActualExpense[];
}
