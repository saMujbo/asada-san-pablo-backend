import { Supplier } from "src/supplier/entities/supplier.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('AgentSupplier')
export class AgentSupplier {
    @PrimaryGeneratedColumn()
    Id: number;
    @Column()
    Name: string;
    @Column()
    Surname1: string;
    @Column()
    Surname2: string;
    @Column()
    Email: string;
    @Column()
    PhoneNumber: string;
    @Column()
    IsActive: boolean;
    @ManyToOne(() => Supplier, (supplier) => supplier.SupplerAgents)
    Supplier: Supplier;
    // @Column()
    // SupplierId: number;
}
