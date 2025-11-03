import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    Id: number;
    
    @Column()
    Icon: string;
    
    @Column()
    Title: string;
    
    @Column()
    Description: string;
    
    @Column({ default: true })
    IsActive: boolean;
}
