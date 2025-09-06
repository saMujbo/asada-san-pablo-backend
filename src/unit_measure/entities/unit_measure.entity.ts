import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UnitMeasure {

    @PrimaryGeneratedColumn()
    Id:number;

    @Column()
    Name:string;

    @Column({ default: true })
    IsActive: boolean

}
