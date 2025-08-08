import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    Id:number;

    @Column({unique:true})
    Rolname:string;

    @Column()
    Description:string;

    // @ManyToMany(()=>User,(user)=>user.Roles)
    // Users:User[];
}
