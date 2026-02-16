// category.entity.ts
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'varchar', length: 160, unique: true })
    Name: string;

    @Column({ type: 'text' })
    Description: string;

    @Column({ type: 'boolean', default: true })
    IsActive: boolean;

    @OneToMany(() => Product, (product) => product.Category)
    Products: Product[];
}
