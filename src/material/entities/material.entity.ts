// material.entity.ts
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Material {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column({ default: true })
    IsActive: boolean;

    // Lado inverso: un material está asociado a muchos productos
    @OneToMany(() => Product, (product) => product.Material)
    Products: Product[];
}
