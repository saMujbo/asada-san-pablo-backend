import { LegalSupplier } from "src/legal-supplier/entities/legal-supplier.entity";
import { Supplier } from "src/supplier/entities/supplier.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

@Entity('agent_supplier')
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
    @Column({ default: true })
    IsActive: boolean;

    @ManyToOne(() => LegalSupplier, (s) => s.AgentSupppliers, { nullable: false })
    @JoinColumn({ name: 'LegalSupplierId' })
    LegalSupplier?: LegalSupplier;
}
