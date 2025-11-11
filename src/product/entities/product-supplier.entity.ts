import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
    Column,
} from 'typeorm';
import { Product } from './product.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';

@Entity('product-supplier')
@Unique(['Product', 'Supplier']) // evita duplicados
export class ProductSupplier {
    @PrimaryGeneratedColumn()
    Id: number;
    
    @ManyToOne(() => Product, (p) => p.ProductSuppliers, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'ProductId' })
    Product: Product;

    @ManyToOne(() => Supplier, (s) => s.ProductSuppliers, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'SupplierId' })
    Supplier: Supplier;
}
