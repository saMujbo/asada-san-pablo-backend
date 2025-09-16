import { Product } from "src/product/entities/product.entity";
import { Project } from "src/project/entities/project.entity";
import { ProjectState } from "src/project/project-state/entities/project-state.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('project_product')
export class ProjectProduct {

    @PrimaryGeneratedColumn()
    idProjectProduct:number;
    
    @ManyToOne(()=> Project,(project)=> project.ProjectProducts, {onDelete:'CASCADE'})
    @JoinColumn({name:'ProjectId'})
    Project:  Project;

    @ManyToOne(()=> Product,(product)=> product.ProjectProducts, {onDelete:'CASCADE'})
    @JoinColumn({name:'ProductId'})
    Product: Product;

    @Column()
    quantity:number; 
}
