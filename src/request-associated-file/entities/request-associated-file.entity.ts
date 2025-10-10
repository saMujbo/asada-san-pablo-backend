import { Project } from "src/project/entities/project.entity";
import { RequestAssociated } from "src/request-associated/entities/request-associated.entity";
import { User } from "src/users/entities/user.entity";
import { PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn, Column, CreateDateColumn, Entity } from "typeorm";


@Entity()
export class RequestAssociatedFile {
        @PrimaryGeneratedColumn()
        Id: number;
    
        @Index()
        @ManyToOne(() => RequestAssociated, (r) => r.RequestAssociatedFile, { onDelete: 'CASCADE', nullable: false })
        @JoinColumn({ name: 'RequestAssociatedId' })
        RequestAssociated: RequestAssociated;
    
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
