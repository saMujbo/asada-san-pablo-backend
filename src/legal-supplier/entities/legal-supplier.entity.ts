import { AgentSupplier } from 'src/agent_supplier/entities/agent_supplier.entity';
import { Product } from 'src/product/entities/product.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Index, OneToOne, JoinColumn } from 'typeorm';

@Entity('legal_supplier')
export class LegalSupplier {
    @PrimaryGeneratedColumn()
    Id: number;

    @OneToOne(() => Supplier, (supplier) => supplier.LegalProvider, {
        cascade: ['insert'], // si quieres que se guarde junto
        eager: true,
    })
    @JoinColumn({ name: 'supplierId' })
    Supplier: Supplier;

    @Column({ type: 'varchar', length: 160, nullable: true })
    WebSite?: string;

    // 1 -> N products
    @OneToMany(() => Product, (p) => p.LegalSupplier, { cascade: false })
    Products?: Product[];

    // 1 -> N agent_supplier
    @OneToMany(() => AgentSupplier, (p) => p.LegalSupplier, { cascade: false })
    AgentSupppliers?: AgentSupplier[];
}
