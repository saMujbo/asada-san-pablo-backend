import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Material {
    @PrimaryGeneratedColumn()
    Id:number;
    
    @Column({unique:true})
    Name:string;

    @Column()
    Description: string;

    @Column({default: true})
    IsActive: boolean;

    @Column({ length: 20, default: "unidad" })
    Unit: string; // "unidad", "m", "kg", "litro", etc.
}
