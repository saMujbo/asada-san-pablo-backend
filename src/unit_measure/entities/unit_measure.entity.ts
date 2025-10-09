import { Product } from "src/product/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UnitMeasure {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column({ default: true })
    IsActive: boolean;

    // Lado inverso: una unidad de medida se usa en muchos productos
    @OneToMany(() => Product, (product) => product.UnitMeasure)
    Products: Product[];
}