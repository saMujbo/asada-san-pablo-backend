import { RequestChangeMeter } from "src/request-change-meter/entities/request-change-meter.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentChangeMeter {
    @PrimaryGeneratedColumn()
    Id: number;
    
    @Column()
    Subject: string;
    
    @Column()
    Comment: string;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(()=>RequestChangeMeter,(requestChangeMeter)=>requestChangeMeter.commentChangeMeter)
    @JoinColumn({ name: 'RequestChangeMeterId' })
    requestChangeMeter: RequestChangeMeter;
}
