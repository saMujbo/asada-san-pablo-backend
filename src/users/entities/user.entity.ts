import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique:true})
    email:string;

    @Column()
    Password:string;

    @ManyToMany(()=>Role,role=> role.users)
    @JoinTable()
    roles:Role[]
}
