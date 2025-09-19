    import {
    Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn,
    } from 'typeorm';
    import { ProductDetail } from 'src/product/product-detail/entities/product-detail.entity';
    import { TraceProject } from 'src/trace-project/entities/trace-project.entity';
import { Matches } from 'class-validator';
import { toDateOnly } from 'src/utils/ToDateOnly';
import { Transform } from 'class-transformer';


    @Entity({ name: 'actual_expense' })
    export class ActualExpense {
    @PrimaryGeneratedColumn()
    Id: number;

    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe ser YYYY-MM-DD',
    })
    Date:Date;

    @Column()
    Observation: string;

    @Column({ default: true })
    IsActive: boolean;

    // 1:N con ProductDetail (la FK vive en ProductDetail)
    @OneToMany(() => ProductDetail, (d) => d.ActualExpense, {
        cascade: ['insert', 'update'],
    })
    ProductDetails: ProductDetail[];

    // M:N con TraceProject (el @JoinTable va SOLO en TraceProject)
    @ManyToMany(() => TraceProject, (tp) => tp.ActualExpenses)
    TraceProjects: TraceProject[];
    }
