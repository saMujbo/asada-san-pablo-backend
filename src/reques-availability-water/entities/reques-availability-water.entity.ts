    import { combineLatest } from "rxjs";
import { CommentAvailabilityWater } from "src/CommentRequest/comment-availability-water/entities/comment-availability-water.entity";
import { RequestAvailabilityWaterFile } from "src/request-availability-water-file/entities/request-availability-water-file.entity";
import { StateRequest } from "src/state-request/entities/state-request.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

    @Entity()
    export class RequesAvailabilityWater {
    @PrimaryGeneratedColumn()
    Id: number;

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

    @Column({default: true})
    IsActive: boolean;

    @Column({default: false})
    CanComment: boolean;

    //Relations
    @ManyToOne(()=> User,(user)=> user.RequesAvailabilityWater)
    @JoinColumn({ name: 'UserId' } )
    User: User;
    
    @ManyToOne(()=> StateRequest,(stateRequest) => stateRequest.RequesAvailabilityWater)
    @JoinColumn({name: 'StateRequestId'})
    StateRequest: StateRequest;

    @OneToMany(()=>CommentAvailabilityWater,(CommentAvailabilityWater)=>CommentAvailabilityWater.requestAvailability)
    commentAvailabilityWater?:CommentAvailabilityWater[];

    @OneToMany(() => RequestAvailabilityWaterFile, (reqf) => reqf.RequesAvailabilityWater)
    RequestAvailabilityWaterFiles: RequestAvailabilityWaterFile[];
}
