import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre: string;

    @Column()
    apellidos: string;

    @Column({ unique: true })
    cedula: string;

    @Column({ nullable: true })
    nis: string;

    @Column({unique:true})
    email:string;

    @Column()
    telefono: string;

    @Column({ type: 'date' })
    fechaNacimiento: Date;

    @Column()
    Password:string;

    @Column()
    confirmPassword: string;
    @ManyToMany(()=>Role,role=> role.users)
    @JoinTable()
    roles:Role[]
}
