import { RequestSupervisionMeter } from "src/requestsupervision-meter/entities/requestsupervision-meter.entity";
import { User } from "src/users/entities/user.entity";
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, ManyToMany, JoinColumn, JoinTable } from "typeorm";

@Entity()
export class CommentSupervisionMeter {            
        @PrimaryGeneratedColumn()
        Id: number;
        
        @Column({ type: 'text' })
        Subject: string;
        
        @Column({ type: 'text' })
        Comment: string;
        
        @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
        createdAt: Date;

        @ManyToOne(()=>RequestSupervisionMeter,
        (requestSupervisionMeter)=>requestSupervisionMeter.commentSupervisionMeter)

        @JoinColumn({ name: 'RequestSupervisionMeterId' })
        requestsupervisionMeter: RequestSupervisionMeter;

        @ManyToOne(() => User, (user) => user.CommentsSupervisionMeter)
        @JoinColumn({ name: 'UserId' })
        User: User;
}
