import { RequestAssociated } from "src/request-associated/entities/request-associated.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentAssociated {
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

        @ManyToOne(()=>RequestAssociated,(requestAssociated)=>requestAssociated.commentAssociated)
        @JoinColumn({name:'RequestAssociatedId'})
        requestAssociated: RequestAssociated;
}
