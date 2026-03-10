import {
    BeforeInsert,
Column, Entity, JoinColumn,OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import { ProductDetail } from 'src/product/product-detail/entities/product-detail.entity';
import { TraceProject } from 'src/trace-project/entities/trace-project.entity';


@Entity({ name: 'actual_expense' })
    export class ActualExpense {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'date', nullable: false })
    date: Date;
    @BeforeInsert()
    setTodayIfMissing() {
        if (!this.date) {
        this.date = new Date(); // TypeORM + MySQL 'date' guarda solo YYYY-MM-DD
        }
    }

    @Column({ type: 'text' })
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
