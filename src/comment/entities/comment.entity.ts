import { PrimaryGeneratedColumn, Column, Entity, BeforeInsert, Index } from "typeorm";

@Entity()
@Index(["IsRead", "CreatedAt"])
@Index(["IsActive", "CreatedAt"])
export class Comment {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'text' })
    Message: string; // falta definir tipos de datos 

    @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    })
    CreatedAt: Date;

    @Column({ default: false })
    IsRead: boolean;

    @Column({ default: true })
    IsActive: boolean;
}
