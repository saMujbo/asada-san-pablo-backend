
export class CreateTraceProjectDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Name:string;

    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'date debe ser YYYY-MM-DD',
    })
    @IsOptional()
    date?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Observation:string;

}
