import { CommentAssociated } from "src/CommentRequest/comment-associated/entities/comment-associated.entity";
import { CommentAvailabilityWater } from "src/CommentRequest/comment-availability-water/entities/comment-availability-water.entity";
import { CommentChangeMeter } from "src/CommentRequest/comment-change-meter/entities/comment-change-meter.entity";
import { CommentChangeNameMeter } from "src/CommentRequest/comment-change-name-meter/entities/comment-change-name-meter.entity";
import { CommentSupervisionMeter } from "src/CommentRequest/comment-supervision-meter/entities/comment-supervision-meter.entity";
import { Project } from "src/project/entities/project.entity";
import { Report } from "src/reports/entities/report.entity";
import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
import { RequestAssociated } from "src/request-associated/entities/request-associated.entity";
import { RequestChangeMeter } from "src/request-change-meter/entities/request-change-meter.entity";
import { RequestChangeNameMeter } from "src/request-change-name-meter/entities/request-change-name-meter.entity";
import { RequestSupervisionMeter } from "src/requestsupervision-meter/entities/requestsupervision-meter.entity";
import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column({ unique: true })
    IDcard: string;
    
    @Column()
    Name: string;

    @Column()
    Surname1: string;

    @Column()
    Surname2: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    ProfilePhoto: string | null;

    @Column({ nullable: true })
    Nis: number[];

    @Column({unique:true})
    Email:string;

    @Column()
    PhoneNumber: string;

    @Column({ type: "date" })
    Birthdate: Date;

    @Column()
    Address: string;

    @Column({default: true})
    IsActive: boolean;

    @Column()
    Password:string;

    //RELATIONS
    @ManyToMany(()=>Role)
    @JoinTable({ name: 'user_roles_role' })
    Roles:Role[];

    @OneToMany(() => Project, (project) => project.User)
    Projects?: Project[];

    @OneToMany(()=>RequesAvailabilityWater,(requesAvailabilityWater)=>requesAvailabilityWater.User)
    RequesAvailabilityWater?:RequesAvailabilityWater[];

    @OneToMany(()=>RequestSupervisionMeter,(requestSupervisionMeter)=>requestSupervisionMeter.User)
    RequestSupervisionMeter?:RequestSupervisionMeter[];

    @OneToMany(()=>RequestChangeMeter,(requestChangeMeter)=>requestChangeMeter.User)
    RequestChangeMeter?:RequestChangeMeter[];

    @OneToMany(()=>RequestChangeNameMeter,(requestChangeNameMeter)=>requestChangeNameMeter.User)
    RequestChangeNameMeter?:RequestChangeNameMeter[];

    @OneToMany(()=>RequestAssociated,(RequestAssociated)=>RequestAssociated.User)
    RequestAssociated?:RequestAssociated[];
    
    @OneToMany(()=>CommentAssociated,(commentAssociated)=>commentAssociated.User)
    CommentsAssociated?:CommentAssociated[];

    @OneToMany(()=>CommentAvailabilityWater,(comment)=>comment.User)
    CommentsAvailabilityWater?:CommentAvailabilityWater[];

    @OneToMany(()=>CommentChangeMeter,(comment)=>comment.User)
    CommentsChangeMeter?:CommentChangeMeter[];

    @OneToMany(()=>CommentChangeNameMeter,(comment)=>comment.User)
    CommentsChangeNameMeter?:CommentChangeNameMeter[];

    @OneToMany(()=>CommentSupervisionMeter,(comment)=>comment.User)
    CommentsSupervisionMeter?:CommentSupervisionMeter[];

    @OneToMany(()=>Report,(report)=>report.User)
    Reports?:Report[];
}
