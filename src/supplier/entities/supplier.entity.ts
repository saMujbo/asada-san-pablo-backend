import { Agent } from "http";
import { AgentSupplier } from "src/agent_supplier/entities/agent_supplier.entity";
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Supplier {

    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column()
    Email: string;

    @Column()
    PhoneNumber: string;

    @Column()
    Location: string;
    
    @Column({ default: true })
    IsActive: boolean;

    @OneToMany(() => Product, (product) => product.Supplier)
        Products: Product[];
    @OneToMany(() => AgentSupplier, (agent) => agent.Supplier)
    SupplierAgents: AgentSupplier[];
}
