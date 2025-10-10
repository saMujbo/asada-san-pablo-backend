import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RequesAvailabilityWater } from 'src/reques-availability-water/entities/reques-availability-water.entity';

@Entity()
export class RequestAvailabilityWaterFile {
    @PrimaryGeneratedColumn()
    Id: number;

    @Index()
    @ManyToOne(() => RequesAvailabilityWater, (req) => req.RequestAvailabilityWaterFiles, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'RequesAvailabilityWaterId' })
    RequesAvailabilityWater: RequesAvailabilityWater;

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
