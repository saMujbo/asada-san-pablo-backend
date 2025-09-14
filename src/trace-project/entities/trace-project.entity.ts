
@Entity()
export class TraceProject {

    @PrimaryGeneratedColumn()
    Id:number;

    @Column()
    Name:string;

  @Transform(({ value }) => toDateOnly(value))
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe ser YYYY-MM-DD',
  })
   date: string;

    @Column()
    Observation:string;

    @Column({default : true})
    IsActive:boolean; 
}
