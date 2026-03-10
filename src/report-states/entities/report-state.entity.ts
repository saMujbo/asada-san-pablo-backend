import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

}
