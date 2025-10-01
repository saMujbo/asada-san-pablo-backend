import { Product } from 'src/product/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('physical_supplier')
export class PhysicalSupplier {
  @PrimaryGeneratedColumn()
  Id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  IDcard: string;

  @Column({ type: 'varchar', length: 120 })
  Name: string;

  @Column()
  Surname1: string;

  @Column()
  Surname2: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  Email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  PhoneNumber: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  Location: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  // 1 -> N products
  @OneToMany(() => Product, (p) => p.PhysicalSupplier, { cascade: false })
  Products?: Product[];
}
