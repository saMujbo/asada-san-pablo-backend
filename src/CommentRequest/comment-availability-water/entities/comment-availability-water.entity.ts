import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentAvailabilityWater {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Subject: string;

    @Column()
    Comment: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(
        () => RequesAvailabilityWater,
        (requestAvailabilityWater) => requestAvailabilityWater.commentAvailabilityWater
    )
    @JoinColumn({ name: 'RequestAvailabilityWaterId' })
    requestAvailability: RequesAvailabilityWater;

    @ManyToOne(() => User, (user) => user.CommentsAvailabilityWater)
    @JoinColumn({ name: 'UserId' })
    User: User;
}
