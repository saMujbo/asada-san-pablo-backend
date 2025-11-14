import { RequestAssociated } from "src/request-associated/entities/request-associated.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

        @ManyToMany(() => User, (user) => user.CommentAssociated)
        @JoinTable({ name: 'comment_associated_users' })
        Users: User[];
}
