import { Category } from "src/categories/entities/category.entity";
import { Material } from "src/material/entities/material.entity";
import { Supplier } from "src/supplier/entities/supplier.entity";
import { UnitMeasure } from "src/unit_measure/entities/unit_measure.entity";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";
@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Name: string;

    @Column()
    Type: string;

    @Column()
    Observation: string;

    @Column({ default: true })
    IsActive: boolean;

    @Index()
    @ManyToOne(() => Category, (category) => category.Products, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "CategoryId" })
    Category: Category;

    @Index()
    @ManyToOne(() => Material, (material) => material.Products, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "MaterialId" })
    Material: Material;

    @Index()
    @ManyToOne(() => UnitMeasure, (unit) => unit.Products, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "UnitMeasureId" })
    UnitMeasure: UnitMeasure;

        @Index()
    @ManyToOne(() => Supplier, (supplier) => supplier.Products, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "SupplierId" })
    Supplier: Category;
}
