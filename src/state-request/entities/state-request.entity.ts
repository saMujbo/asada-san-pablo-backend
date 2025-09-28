import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";

@Entity()
export class StateRequest {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column()
    Name:string;

    @Column()
    Description: string;

    @Column({default:true})
    IsActive: boolean;

    @OneToMany(()=>RequesAvailabilityWater,(requesAvailabilityWater)=>requesAvailabilityWater.StateRequest)
    RequesAvailabilityWater?:RequesAvailabilityWater[];
}
