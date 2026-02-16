import { Product } from 'src/product/entities/product.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Index, JoinColumn, OneToOne } from 'typeorm';

@Entity('physical_supplier')
export class PhysicalSupplier {
  @PrimaryGeneratedColumn()
  Id: number;

  @OneToOne(() => Supplier, (supplier) => supplier.PhysicalProvider, {
    cascade: ['insert'],
    eager: true,
  })
  @JoinColumn({ name: 'supplierId' })
  Supplier: Supplier;

  @Column()
  Surname1: string;

  @Column()
  Surname2: string;

  // 1 -> N products
  @OneToMany(() => Product, (p) => p.PhysicalSupplier, { cascade: false })
  Products?: Product[];
}
