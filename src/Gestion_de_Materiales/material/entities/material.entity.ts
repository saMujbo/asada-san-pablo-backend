import { MaterialAsignado } from "src/Gestion_de_Materiales/material-asignado/entities/material-asignado.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Material {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column({ nullable: true })
    Description: string;

    @Column()
    UnitMeasurement: string;

    @Column({ nullable: true })
    Type: string; // Ej. "Tubería", "Accesorios"

    @Column({ default: true })
    Active: boolean;

    @OneToMany(() => MaterialAsignado, (asignado) => asignado.material)
    asignaciones: MaterialAsignado[];
}
