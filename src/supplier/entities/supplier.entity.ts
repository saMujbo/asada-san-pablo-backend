import { LegalSupplier } from "src/legal-supplier/entities/legal-supplier.entity";
import { PhysicalSupplier } from "src/physical-supplier/entities/physical-supplier.entity";
import { ProductSupplier } from "src/product/entities/product-supplier.entity";
import { Entity, PrimaryGeneratedColumn, Index, Column, OneToOne, OneToMany } from "typeorm";

export enum ProviderType {
    PHYSICAL = 'PHYSICAL',
    LEGAL = 'LEGAL',
}

@Entity('supplier')
export class Supplier {
    @PrimaryGeneratedColumn()
    Id: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 40 })
    IDcard: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    Name: string;

    @Column({ type: 'varchar', length: 160, nullable: true })
    Email?: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    PhoneNumber?: string;

    @Column({ type: 'varchar', length: 160, nullable: true })
    Location?: string;

    @Column({ type: 'boolean', default: true })
    IsActive: boolean;

    // opcional pero MUY útil para saber qué hijo usar
    @Column({
        type: 'enum',
        enum: ProviderType,
    })
    Type: ProviderType;

    @OneToOne(() => PhysicalSupplier, (p) => p.Supplier)
    PhysicalProvider?: PhysicalSupplier;

    @OneToOne(() => LegalSupplier, (j) => j.Supplier)
    LegalProvider?: LegalSupplier;

    @OneToMany(() => ProductSupplier, (ps) => ps.Supplier, {
        cascade: ['insert', 'update'],
    })
    ProductSuppliers: ProductSupplier[];
}