import { ProductDetail } from "src/product/product-detail/entities/product-detail.entity";
import { TraceProject } from "src/trace-project/entities/trace-project.entity";
import { Column, ColumnTypeUndefinedError, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ActualExpense {

    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: "date" })
    Date: Date;

    @Column()
    Observation: string;

    @Column()
    IsActive: boolean;

    @OneToMany(()=>ProductDetail,(productDetail)=>productDetail.ActualExpense,{
        cascade: ["insert", "update"],
    })
    ProductDetails: ProductDetail[];

    @ManyToMany(() => TraceProject, (actualExpense) => actualExpense.ActualExpenses)
    TraceProjects: TraceProject[];
}

