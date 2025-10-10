import { CommentRequest } from "src/comment-request/entities/comment-request.entity";
import { ProjectFile } from "src/project-file/entities/project-file.entity";
import { RequestChangeNameMeterFile } from "src/request-change-name-meter-file/entities/request-change-name-meter-file.entity";
import { StateRequest } from "src/state-request/entities/state-request.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestChangeNameMeter {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column({ nullable: true })
    Justification: string;

    @Column({ type: 'date', nullable: false })
    Date: Date;
        
    @BeforeInsert()
    setTodayIfMissing() {
    if (!this.Date) {
        this.Date = new Date(); // TypeORM + MySQL 'date' guarda solo YYYY-MM-DD
        }
    }
    // ---- Required Documents ----
    @Column({ type: 'text', nullable: true })
    SpaceOfDocument: string | null;
    
    @Column({default:true})
    IsActive: boolean

    @ManyToOne(()=> User,(user)=> user.RequestChangeNameMeter)
    @JoinColumn({ name: 'UserId' } )
    User: User;
    
    @ManyToOne(()=> StateRequest,(stateRequest) => stateRequest.RequestChangeNameMeter)
    @JoinColumn({name: 'StateRequestId'})
    StateRequest: StateRequest;

    @OneToMany(()=>CommentRequest,(commentRequest)=>commentRequest.RequestChangeNameMeter)
    commentRquest?: CommentRequest[];

    @OneToMany(() => RequestChangeNameMeterFile, (rm) => rm.RequestChangeNameMeter)
    RequestChangeNameMeterFile: RequestChangeNameMeterFile[];

}
