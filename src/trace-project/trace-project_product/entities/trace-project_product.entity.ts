
@Entity('Trace-ProjectProduct')
export class TraceProjectProduct {
    
    @PrimaryGeneratedColumn()
    IdTrace_Projectproduct: number;

    @Column()
    Amount:number; 
}
