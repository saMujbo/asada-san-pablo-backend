import { MaterialAsignado } from "src/Gestion_de_Materiales/material-asignado/entities/material-asignado.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Material {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column()
    unidadMedida: string;

    @Column({ nullable: true })
    tipo: string; // Ej. "Tubería", "Accesorios"

    @Column({ default: true })
    activo: boolean;

    @OneToMany(() => MaterialAsignado, (asignado) => asignado.material)
    asignaciones: MaterialAsignado[];
}
