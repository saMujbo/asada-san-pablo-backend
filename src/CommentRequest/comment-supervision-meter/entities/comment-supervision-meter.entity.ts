import { RequestSupervisionMeter } from "src/requestsupervision-meter/entities/requestsupervision-meter.entity";
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinColumn } from "typeorm";

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
}
