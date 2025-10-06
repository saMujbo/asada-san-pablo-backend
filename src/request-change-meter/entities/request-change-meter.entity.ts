import { CommentRequest } from "src/comment-request/entities/comment-request.entity";
import { StateRequest } from "src/state-request/entities/state-request.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestChangeMeter {
    @PrimaryGeneratedColumn()
    Id:number;

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
        
    @ManyToOne(()=> StateRequest,(stateRequest) => stateRequest.RequestChangeMeter)
    @JoinColumn({name: 'StateRequestId'})
    StateRequest: StateRequest;
    
    @OneToMany(()=>CommentRequest,(commentRequest)=>commentRequest.RequestChangeMeter)
    commentRquest?: CommentRequest[];
}
