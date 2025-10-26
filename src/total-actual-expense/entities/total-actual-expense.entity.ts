import { ProductDetail } from "src/product/product-detail/entities/product-detail.entity";
import { Project } from "src/project/entities/project.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TotalActualExpense {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column()
    Description:string;

    @Column('simple-array', { nullable: true })
    ActualExpenseIds?: number[];

    @OneToOne(()=>Project,(project)=>project.TotalActualExpense)
    Project: Project;

    @OneToMany(() => ProductDetail, (producDetail) => producDetail.TotalActualExpense)
    ProductDetails: ProductDetail[];
}
