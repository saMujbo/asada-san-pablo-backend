// category.entity.ts
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ unique: true })
    Name: string;

    @Column()
    Description: string;

    @Column({ default: true })
    IsActive: boolean;

    // Lado inverso: una categoría tiene muchos productos
    @OneToMany(() => Product, (product) => product.Category)
    Products: Product[];
}
