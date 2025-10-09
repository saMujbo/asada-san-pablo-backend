import { ProductDetail } from "src/product/product-detail/entities/product-detail.entity";
import { Project } from "src/project/entities/project.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProjectProjection {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Observation: string;

    @OneToMany(() => ProductDetail, (projectDetail) => projectDetail.ProjectProjection,{
        cascade: ["insert", "update"],
    })   
    ProductDetails: ProductDetail[];

    @OneToOne(()=>Project,(project)=>project.ProjectProjection)
    Project:Project;
}
