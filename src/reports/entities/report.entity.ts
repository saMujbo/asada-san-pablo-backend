import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'varchar', length: 255 })
    Location: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    CreatedAt: Date;

    @Column()
    // relacion con UserId
}

