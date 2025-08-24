import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Material {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column()
    Name:string;

    @Column()
    Description: string;

    @Column({default: true})
    IsActive: boolean;
}
