import { ActualExpense } from "src/actual-expense/entities/actual-expense.entity";
import { Product } from "src/product/entities/product.entity";
import { ProjectProjection } from "src/project-projection/entities/project-projection.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('product_details')
export class ProductDetail {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    Quantity: number;

        // FK → Product.Id
    @Index()
    @ManyToOne(() => Product, (p) => p.ProductDetails, {
        nullable: false,
        onDelete: "RESTRICT", // o "CASCADE" si quieres borrar detalles al borrar el producto
    })
    @JoinColumn({ name: "ProductId" })
    Product: Product;

    @Index()
    @ManyToOne(() => ProjectProjection, (projectProjection) => projectProjection.ProductDetails)
    @JoinColumn({ name: "ProjectProjectionId" })
    ProjectProjection?: ProjectProjection;

    @Index()
    @ManyToOne(() => ActualExpense, (actualExpense) => actualExpense.ProductDetails)
    @JoinColumn({ name: "ActualExpenseId" })
    ActualExpense?: ActualExpense;
}
