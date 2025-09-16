import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProjectState } from "../project-state/entities/project-state.entity";
import { Product } from "src/product/entities/product.entity";
import { Role } from "src/roles/entities/role.entity";
import { ProjectProduct } from "../project_product/entities/project_product.entity";

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ unique: true })
    Name: string;

    @Column()
    Location: string;

    @Column({ type: "date" })
    InnitialDate: Date; // (sic) respeta el nombre del diagrama

    @Column({ type: "date", nullable: true })
    EndDate: Date | null; // puede ser null si el proyecto sigue activo

    @Column({ type: "varchar", length: 255, nullable: true })
    SpaceOfDocument: string | null; // p.ej. folderId/URL de Drive

    @Column()
    Objective: string;

    @Column()
    Description: string;

    @Column({ type: 'text' })
    Observation: string | null;

    @Column({ default: true })
    IsActive: boolean;

    //RELATIONS
    @Index()
    @ManyToOne(() => ProjectState, (projectState) => projectState.Projects, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "ProjectStateId" })
    ProjectState: ProjectState;

    @OneToMany(() => ProjectProduct, (ProjectProduct) => ProjectProduct.Project)
    ProjectProducts?: ProjectProduct[];
}
