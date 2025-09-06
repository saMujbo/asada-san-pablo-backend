import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    Id:number;
    
    @Column({unique:true})
    Name:string;
    
    @Column()
    Description:string;

    @Column({default: true})
    IsActive: boolean;
}
