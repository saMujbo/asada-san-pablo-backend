import { RequestChangeNameMeter } from "src/request-change-name-meter/entities/request-change-name-meter.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentChangeNameMeter {
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
            () => RequestChangeNameMeter,
            (requestChangeNameMeter) => requestChangeNameMeter.commentChangeNameMeter
        )
        @JoinColumn({ name: 'RequestChangeNameMeterId' })
        requestChangeNameMeter: RequestChangeNameMeter;
}
