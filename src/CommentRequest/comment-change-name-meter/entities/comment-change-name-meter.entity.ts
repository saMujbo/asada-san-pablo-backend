import { RequestChangeNameMeter } from "src/request-change-name-meter/entities/request-change-name-meter.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentChangeNameMeter {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'text' })
    Subject: string;

    @Column({ type: 'text' })
    Comment: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(
        () => RequestChangeNameMeter,
        (requestChangeNameMeter) => requestChangeNameMeter.commentChangeNameMeter
    )
    @JoinColumn({ name: 'RequestChangeNameMeterId' })
    requestChangeNameMeter: RequestChangeNameMeter;

    @ManyToOne(() => User, (user) => user.CommentsChangeNameMeter)
    @JoinColumn({ name: 'UserId' })
    User: User;
}
