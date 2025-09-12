import { Product } from "src/product/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Supplier {

    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column({ default: true })
    IsActive: boolean;

    @OneToMany(() => Product, (product) => product.Supplier)
        Products: Product[];
}
