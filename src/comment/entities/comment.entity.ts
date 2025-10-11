import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Message: string;

    @Column({ default: true })
    IsActive: boolean;
}
