import { AgentSupplier } from 'src/agent_supplier/entities/agent_supplier.entity';
import { Product } from 'src/product/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('legal_supplier')
export class LegalSupplier {
    @PrimaryGeneratedColumn()
    Id: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 40 })
    LegalID: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 160 })
    CompanyName: string;

    @Column({ type: 'varchar', length: 160, nullable: true })
    Email?: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    PhoneNumber?: string;

    @Column({ type: 'varchar', length: 160, nullable: true })
    Location?: string;

    @Column({ type: 'varchar', length: 160, nullable: true })
    WebSite?: string;

    @Column({ type: 'boolean', default: true })
    IsActive: boolean;

    // 1 -> N products
    @OneToMany(() => Product, (p) => p.LegalSupplier, { cascade: false })
    Products?: Product[];

    // 1 -> N agent_supplier
    @OneToMany(() => AgentSupplier, (p) => p.LegalSupplier, { cascade: false })
    AgentSupppliers?: AgentSupplier[];
}
