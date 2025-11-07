
import { CommentChangeMeter } from "src/CommentRequest/comment-change-meter/entities/comment-change-meter.entity";
import { StateRequest } from "src/state-request/entities/state-request.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestChangeMeter {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    Date: Date;

    @BeforeInsert()
    setTodayIfMissing() {
    if (!this.Date) this.Date = new Date(); // guarda YYYY-MM-DD en MySQL
    }

    @Column()
    Location:string;

    @Column()
    NIS:number;

    @Column()
    Justification:string;

    @Column({default:true})
    IsActive:boolean;

    @ManyToOne(()=> User,(user)=> user.RequestChangeMeter)
    @JoinColumn({ name: 'UserId' } )
    User: User;
    
    @OneToMany(()=>CommentChangeMeter,(CHM)=>CHM.requestChangeMeter)
    commentChangeMeter:CommentChangeMeter;

    @ManyToOne(()=> StateRequest,(stateRequest) => stateRequest.RequestChangeMeter)
    @JoinColumn({name: 'StateRequestId'})
    StateRequest: StateRequest;

}
