import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
import { RequestChangeMeter } from "src/request-change-meter/entities/request-change-meter.entity";
import { RequestChangeNameMeter } from "src/request-change-name-meter/entities/request-change-name-meter.entity";
import { RequestSupervisionMeter } from "src/requestsupervision-meter/entities/requestsupervision-meter.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentRequest {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Subject: string;

    @Column()
    Comment: string

    @ManyToOne(()=>RequesAvailabilityWater,(requestAvaillabilityWater)=> requestAvaillabilityWater.commentRquest)
    @JoinColumn({name:'RequestAvailabilityWaterId'})
    requestAvailability:RequesAvailabilityWater;

    @ManyToOne(()=>RequestSupervisionMeter,(requestSupervisionMeter)=> requestSupervisionMeter.commentRquest)
    @JoinColumn({name:'RequestSupervisionMeterId'})
    RequestSupervisionMeter:RequestSupervisionMeter;

    @ManyToOne(()=>RequestChangeMeter,(requestChangeMeter)=> requestChangeMeter.commentRquest)
    @JoinColumn({name:'RequestChangeMeterId'})
    RequestChangeMeter:RequestChangeMeter;

    @ManyToOne(()=>RequestChangeNameMeter,(requestChangeNameMeter)=> requestChangeNameMeter.commentRquest)
    @JoinColumn({name:'RequestChangeNameMeterId'})
    RequestChangeNameMeter:RequestChangeNameMeter
}
