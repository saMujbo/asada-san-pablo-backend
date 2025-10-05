import { Project } from "src/project/entities/project.entity";
import { RequesAvailabilityWater } from "src/reques-availability-water/entities/reques-availability-water.entity";
import { RequestChangeMeter } from "src/request-change-meter/entities/request-change-meter.entity";
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
    Nis: string;

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
}
