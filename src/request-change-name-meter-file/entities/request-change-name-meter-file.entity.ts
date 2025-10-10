import { Project } from "src/project/entities/project.entity";
import { RequestChangeNameMeter } from "src/request-change-name-meter/entities/request-change-name-meter.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestChangeNameMeterFile {
        @PrimaryGeneratedColumn()
        Id: number;
    
        @Index()
        @ManyToOne(() => RequestChangeNameMeter, (r) => r.RequestChangeNameMeterFile, { onDelete: 'CASCADE', nullable: false })
        @JoinColumn({ name: 'RequestChangeNameMeterid' })
        RequestChangeNameMeter: RequestChangeNameMeter;
    
        @ManyToOne(() => User, { nullable: true })
        @JoinColumn({ name: 'UploadedByUserId' })
        UploadedBy?: User | null;
    
        // Ruta completa en Dropbox (ej: /Proyectos/0007-plantas-potabilizadora/Planos/cedula.pdf)
        @Column({ type: 'text' })
        Path: string;
    
        // Nombre de archivo (lo que el usuario subió)
        @Column()
        FileName: string;
    
        @Column({ nullable: true })
        MimeType?: string;
    
        @Column({ type: 'bigint', nullable: true })
        Size?: number;
    
        // Útil para control de versiones y borrados
        @Column({ nullable: true })
        Rev?: string;
    
        @CreateDateColumn()
        UploadedAt: Date;
}
