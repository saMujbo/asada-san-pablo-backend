
import { CommentSupervisionMeter } from "src/CommentRequest/comment-supervision-meter/entities/comment-supervision-meter.entity";
import { StateRequest } from "src/state-request/entities/state-request.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestSupervisionMeter {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'date', nullable: false })
    Date: Date;

    @BeforeInsert()
    setTodayIfMissing() {
    if (!this.Date) {
    this.Date = new Date(); // TypeORM + MySQL 'date' guarda solo YYYY-MM-DD
            }
    }

    @Column()
    Location:string;

    @Column()
    NIS: number;

    @Column()
    Justification:string;

    @Column({default: true})
    IsActive: boolean;

    @Column({default: false})
    CanComment: boolean;
    
    //Relations
    
    @ManyToOne(()=> User,(user)=> user.RequestSupervisionMeter)
    @JoinColumn({ name: 'UserId' } )
    User: User;
    
    @ManyToOne(()=> StateRequest,(stateRequest) => stateRequest.RequestSupervisionMeter)
    @JoinColumn({name: 'StateRequestId'})
    StateRequest: StateRequest;

    @OneToMany(()=>CommentSupervisionMeter,(commentSupervisionMeter)=>commentSupervisionMeter.requestsupervisionMeter)
    commentSupervisionMeter: CommentSupervisionMeter;
}
