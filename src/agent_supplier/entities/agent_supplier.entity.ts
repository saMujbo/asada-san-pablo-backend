import { Supplier } from "src/supplier/entities/supplier.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

@Entity('agent_supplier')
export class AgentSupplier {
    @PrimaryGeneratedColumn()
    Id: number;
    @Column()
    Name: string;
    @Column()
    Surname1: string;
    @Column()
    Surname2: string;
    @Column()
    Email: string;
    @Column()
    PhoneNumber: string;
    @Column({ default: true })
    IsActive: boolean;

    @Index()
    @ManyToOne(() => Supplier, (supplier) => supplier.SupplierAgents, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "SupplierId" })
    Supplier: Supplier;
    // @ManyToOne(() => Supplier, (supplier) => supplier.SupplierAgents, {
    //     nullable: false,
    //     onDelete: 'RESTRICT',
    // })
    // @JoinColumn({ name: 'SupplierId', referencedColumnName: 'Id' })
    // Supplier: Supplier;

    // // Si quieres leer el id sin cargar la relación:
    // @RelationId((a: AgentSupplier) => a.Supplier)
    // SupplierId: number; // <-- NO pongas @Column aquí
}
