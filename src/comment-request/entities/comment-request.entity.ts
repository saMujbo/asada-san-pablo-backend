import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
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
}
