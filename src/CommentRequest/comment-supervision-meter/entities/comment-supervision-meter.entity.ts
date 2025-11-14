import { RequestSupervisionMeter } from "src/requestsupervision-meter/entities/requestsupervision-meter.entity";
import { User } from "src/users/entities/user.entity";
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, ManyToMany, JoinColumn, JoinTable } from "typeorm";

@Entity()
export class CommentSupervisionMeter {            
        @PrimaryGeneratedColumn()
        Id: number;
        
        @Column()
        Subject: string;
        
        @Column()
        Comment: string;
        
        @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
        createdAt: Date;

        @ManyToOne(()=>RequestSupervisionMeter,(RSP)=>RSP)
        @JoinColumn({ name: 'RequestSupervisionMeterId' })
        requestsupervisionMeter: RequestSupervisionMeter;

        @ManyToMany(() => User, (user) => user.CommentSupervisionMeter)
        @JoinTable({ name: 'comment_supervision_meter_users' })
        Users: User[];
}
