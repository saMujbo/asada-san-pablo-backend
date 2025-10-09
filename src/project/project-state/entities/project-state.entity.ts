import { Project } from "src/project/entities/project.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProjectState {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column()
    Description: string;

    @Column({ default: true })
    IsActive: boolean;

    @OneToMany(() => Project, (project) => project.ProjectState)
    Projects: Project[];
}
