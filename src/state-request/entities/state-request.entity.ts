import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
import { RequestChangeMeter } from "src/request-change-meter/entities/request-change-meter.entity";
import { RequestChangeNameMeter } from "src/request-change-name-meter/entities/request-change-name-meter.entity";
import { RequestSupervisionMeter } from "src/requestsupervision-meter/entities/requestsupervision-meter.entity";
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

    @OneToMany(()=>RequestSupervisionMeter,(requestSupervisionMeter)=>requestSupervisionMeter.StateRequest)
    RequestSupervisionMeter?:RequestSupervisionMeter[];

    @OneToMany(()=>RequestChangeMeter,(requestChangeMeter)=>requestChangeMeter.StateRequest)
    RequestChangeMeter?:RequestChangeMeter[];

    @OneToMany(()=>RequestChangeNameMeter,(requestChangeNameMeter)=>requestChangeNameMeter.StateRequest)
    RequestChangeNameMeter?:RequestChangeNameMeter[];
}
