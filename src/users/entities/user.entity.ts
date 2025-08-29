import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

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
    ProfilePhoto: string | null 

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

    @ManyToMany(()=>Role)
    @JoinTable({ name: 'user_roles_role' })
    Roles:Role[];
}
