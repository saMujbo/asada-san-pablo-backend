import { Report } from "src/reports/entities/report.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('report_states')
export class ReportState {
    @PrimaryGeneratedColumn()
    IdReportState: number;

    // agregamos validaciones a nivel de base de datos
    @Column({type: 'varchar', length: 15, unique: true, nullable: false})
    Name: string;

    // Estado activo o inactivo
    @Column({ default: true })
    IsActive: boolean;

    // definimos una relacion con la entidad Report
    @OneToMany(() => Report, (report) => report.ReportState)
    Reports: Report[];
}
