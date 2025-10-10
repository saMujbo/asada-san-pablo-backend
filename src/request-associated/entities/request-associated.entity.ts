import { CommentRequest } from "src/comment-request/entities/comment-request.entity";
import { RequestAssociatedFile } from "src/request-associated-file/entities/request-associated-file.entity";
import { StateRequest } from "src/state-request/entities/state-request.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestAssociated {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column({ unique: true })
    IDcard: string;
    
    @Column({ type: 'date', nullable: false })
    Date: Date;
    
    @BeforeInsert()
    setTodayIfMissing() {
        if (!this.Date) {
          this.Date = new Date(); // TypeORM + MySQL 'date' guarda solo YYYY-MM-DD
        }
    }
    @Column()
    Name: string;

    @Column()
    Justificattion:string;

    @Column()
    Surname1: string;

    @Column()
    Surname2: string;

    @Column()
    NIS:number;

    @Column({ type: 'text', nullable: true })
    SpaceOfDocument: string | null;
    
    @Column({default: true})
    IsActive: boolean;

    @ManyToOne(()=> User,(user)=> user.RequestAssociated)
    @JoinColumn({ name: 'UserId' } )
    User: User;

    @ManyToOne(()=> StateRequest,(stateRequest) => stateRequest.RequestAssociated)
    @JoinColumn({name: 'StateRequestId'})
    StateRequest: StateRequest;

    @OneToMany(()=>CommentRequest,(commentRequest)=>commentRequest.RequestAssociate)
    commentRquest?: CommentRequest[];

    @OneToMany(() => RequestAssociatedFile, (ra) => ra.RequestAssociated)
    RequestAssociatedFile: RequestAssociated[];

}
