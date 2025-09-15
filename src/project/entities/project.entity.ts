import { text } from "body-parser";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
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
}
