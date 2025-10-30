import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FAQ {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Question: string;
    
    @Column({ type: 'text' })
    Answer: string;

    @Column({ default: true })
    IsActive: boolean;
}
