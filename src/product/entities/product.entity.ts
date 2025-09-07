import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    Id:number;

    @Column({unique:true})
    Name:string;

    @Column()
    Type:string;

    @Column()
    Observation:string;

    @Column({ default: true })
    IsActive:boolean; 
    

}
