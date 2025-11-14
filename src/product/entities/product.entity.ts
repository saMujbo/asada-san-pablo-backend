import { Category } from "src/categories/entities/category.entity";
import { Material } from "src/material/entities/material.entity";
import { UnitMeasure } from "src/unit_measure/entities/unit_measure.entity";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Index,
    OneToMany,
} from "typeorm";
import { ProductDetail } from "../product-detail/entities/product-detail.entity";
import { LegalSupplier } from "src/legal-supplier/entities/legal-supplier.entity";
import { PhysicalSupplier } from "src/physical-supplier/entities/physical-supplier.entity";
import { ProductSupplier } from "./product-supplier.entity";
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

    @OneToMany(() => ProductDetail, (d) => d.Product, {
        cascade: ["insert", "update"], 
        nullable: false,                   // true si quieres que siempre cargue los detalles
    })
    ProductDetails?: ProductDetail[];

    @ManyToOne(() => PhysicalSupplier, (s) => s.Products, { nullable: true })
    @JoinColumn({ name: 'PhysicalSupplierId' })
    PhysicalSupplier?: PhysicalSupplier;

    @ManyToOne(() => LegalSupplier, (s) => s.Products, { nullable: true })
    @JoinColumn({ name: 'LegalSupplierId' })
    LegalSupplier?: LegalSupplier;

    @OneToMany(() => ProductSupplier, (ps) => ps.Product, {
        cascade: ['insert', 'update'],
    })
    ProductSuppliers: ProductSupplier[];
}
