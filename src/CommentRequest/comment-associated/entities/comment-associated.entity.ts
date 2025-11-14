import { RequestAssociated } from "src/request-associated/entities/request-associated.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentAssociated {
        @PrimaryGeneratedColumn()
        Id: number;
        
        @Column()
        Subject: string;
        
        @Column()
        Comment: string;
        
        @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
        createdAt: Date;

        @ManyToOne(()=>RequestAssociated,(requestAssociated)=>requestAssociated.commentAssociated)
        @JoinColumn({name:'RequestAssociatedId'})
        requestAssociated: RequestAssociated;

        @ManyToOne(()=>User,(user)=>user.CommentsAssociated)
        @JoinColumn({name:'UserId'})
        User: User;
}
