import {
    BeforeInsert,
Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductDetail } from 'src/product/product-detail/entities/product-detail.entity';
import { TraceProject } from 'src/trace-project/entities/trace-project.entity';
import { Matches } from 'class-validator';
import { toDateOnly } from 'src/utils/ToDateOnly';
import { Transform } from 'class-transformer';


@Entity({ name: 'actual_expense' })
    export class ActualExpense {
    @PrimaryGeneratedColumn()
    Id: number;

    // @Transform(({ value }) => toDateOnly(value))
    // @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    // message: 'date debe ser YYYY-MM-DD',
    // })
    // Date:Date;

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

    @OneToMany(() => ProductDetail, (producDetail) => producDetail.ActualExpense)
    ProductDetails: ProductDetail[];

    @OneToOne(()=>TraceProject,(traceProject)=>traceProject.ActualExpense,{
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "TraceProjectId"})
    TraceProject:TraceProject;

}
