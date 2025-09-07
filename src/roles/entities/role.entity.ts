import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
    static ADMIN(ADMIN: any): (target: typeof import("../../product/product.controller").ProductController) => void | typeof import("../../product/product.controller").ProductController {
      throw new Error('Method not implemented.');
    }
    @PrimaryGeneratedColumn()
    Id:number;

    @Column({unique:true})
    Rolname:string;

    @Column()
    Description:string;
}
