  import { Transform } from "class-transformer";
import { Matches } from "class-validator";
import { ActualExpense } from "src/actual-expense/entities/actual-expense.entity";
  import { toDateOnly } from "src/utils/ToDateOnly";

  import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";

  @Entity()
  export class TraceProject {

      @PrimaryGeneratedColumn()
      Id:number;

      @Column()
      Name:string;

    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'date debe ser YYYY-MM-DD',
    })
    date: string;

      @Column()
      Observation:string;

      @Column({default : true})
      IsActive:boolean; 

      @ManyToMany(() => ActualExpense, (traceProject) => traceProject.TraceProjects)
      @JoinTable({name: "TraceProjectActualExpenses"})
      ActualExpenses: ActualExpense[];
  }
