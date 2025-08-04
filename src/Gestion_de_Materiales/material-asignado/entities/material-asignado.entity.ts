import { Material } from "src/Gestion_de_Materiales/material/entities/material.entity";
import { Proyecto } from "src/Gestion_de_Materiales/proyecto/entities/proyecto.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MaterialAsignado {
    @PrimaryGeneratedColumn()
    Id: number;

    @ManyToOne(() => Material, (material) => material.asignaciones, { eager: true })
    material: Material;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.materialesAsignados, { eager: true })
    proyecto: Proyecto;

    @Column({ type: 'date' })
    fechaAsignacion: Date;

    @Column({ nullable: true })
    Observations: string;
}
