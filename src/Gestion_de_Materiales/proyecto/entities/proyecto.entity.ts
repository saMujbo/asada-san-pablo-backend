import { MaterialAsignado } from "src/Gestion_de_Materiales/material-asignado/entities/material-asignado.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Proyecto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ type: 'date' })
    fechaInicio: Date;

    @Column({ type: 'date', nullable: true })
    fechaFin: Date;

    @Column({ default: 'planificado' })
    estado: string;

    @OneToMany(() => MaterialAsignado, (asignado) => asignado.proyecto)
    materialesAsignados: MaterialAsignado[];
}
