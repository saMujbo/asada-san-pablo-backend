import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentAvailabilityWater {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Subject: string;

    @Column()
    Comment: string;

    @Column({ default: false })
    hasFileUpdate: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(
        () => RequesAvailabilityWater,
        (requestAvailabilityWater) => requestAvailabilityWater.commentAvailabilityWater
    )
    @JoinColumn({ name: 'RequestAvailabilityWaterId' })
    requestAvailability: RequesAvailabilityWater;
}
