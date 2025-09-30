    import { StateRequest } from "src/state-request/entities/state-request.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @Column('simple-array', { nullable: true })
    IdCardFiles: string[]; // original + copy

    @Column('simple-array', { nullable: true })
    PlanoPrintFiles: string[]; // original + copy

    @Column({ nullable: true })
    LiteralCertificateFile: string;

    @Column({ nullable: true })
    RequestLetterFile: string;

    @Column({ nullable: true })
    ConstructionPermitFile: string;

    @Column({default: true})
    IsActive: boolean;

    @ManyToOne(()=> User,(user)=> user.RequesAvailabilityWater)
    @JoinColumn({ name: 'UserId' } )
    User: User;
    
    @ManyToOne(()=> StateRequest,(stateRequest) => stateRequest.RequesAvailabilityWater)
    @JoinColumn({name: 'StateRequestId'})
    StateRequest: StateRequest;
}
