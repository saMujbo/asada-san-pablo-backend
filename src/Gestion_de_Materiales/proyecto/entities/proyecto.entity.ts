import { MaterialAsignado } from "src/Gestion_de_Materiales/material-asignado/entities/material-asignado.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Proyecto {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column({ nullable: true })
    Description: string;

    @Column({ type: 'date' })
    FechaInicio: Date;

    @Column({ type: 'date', nullable: true })
    FechaFin: Date;

    @Column({ default: 'planificado' })
    Estate: string;

    @OneToMany(() => MaterialAsignado, (asignado) => asignado.proyecto)
    materialesAsignados: MaterialAsignado[];
}
