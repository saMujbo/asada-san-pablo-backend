import { LegalSupplier } from "src/supplier/legal-supplier/entities/legal-supplier.entity";
import { PhysicalSupplier } from "src/supplier/physical-supplier/entities/physical-supplier.entity";
import { ProductSupplier } from "src/product/entities/product-supplier.entity";
import { Entity, PrimaryGeneratedColumn, Index, Column, OneToOne, OneToMany } from "typeorm";

export enum ProviderType {
    PHYSICAL = 'PHYSICAL',
    LEGAL = 'LEGAL',
}

@Entity('supplier')
export class Supplier {
    @PrimaryGeneratedColumn()
    Id!: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 40, nullable: false })
    IDcard!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255, nullable: false })
    Name!: string;

    @Column({ type: 'varchar', length: 254, nullable: false })
    Email!: string;

    @Column({ type: 'varchar', length: 40, nullable: false })
    PhoneNumber!: string;

    @Column({ type: 'text', nullable: false })
    Location!: string;

    @Column({ type: 'boolean', default: true, nullable: false })
    IsActive!: boolean;

    // opcional pero MUY útil para saber qué hijo usar
    @Column({
        type: 'enum',
        enum: ProviderType,
        nullable: false
    })
    Type!: ProviderType;

    @OneToOne(() => PhysicalSupplier, (p) => p.Supplier)
    PhysicalProvider?: PhysicalSupplier;

    @OneToOne(() => LegalSupplier, (j) => j.Supplier)
    LegalProvider?: LegalSupplier;

    @OneToMany(() => ProductSupplier, (ps) => ps.Supplier, {
        cascade: ['insert', 'update'],
    })
    ProductSuppliers?: ProductSupplier[];
}