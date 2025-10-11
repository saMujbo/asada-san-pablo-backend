import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    Location: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    Description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    CreatedAt: Date;

    @Column()
    UserId: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'UserId' })
    User: User;
}

