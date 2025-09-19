import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProjectState } from "../project-state/entities/project-state.entity";
import { ProjectProjection } from "src/project-projection/entities/project-projection.entity";

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ unique: true })
    Name: string;

    @Column({ type: 'text' })
    Location: string;

    @Column({ type: "date" })
    InnitialDate: Date; // (sic) respeta el nombre del diagrama

    @Column({ type: "date", nullable: true })
    EndDate: Date | null; // puede ser null si el proyecto sigue activo

    @Column({ type: 'text', nullable: true })
    SpaceOfDocument: string | null; // p.ej. folderId/URL de Drive

    @Column({ type: 'text' })
    Objective: string;

    @Column({ type: 'text' })
    Description: string;

    @Column({ type: 'text' })
    Observation?: string | null;

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

    @OneToOne(()=>ProjectProjection,(projectprojection)=>projectprojection.Project,{
        cascade: ["insert", "update"],
    })
    @JoinColumn({name:"ProjectProjectionId"})
    ProjectProjection:ProjectProjection;
}
