import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, Matches, IsOptional, isIn, IsInt } from "class-validator";
import { toDateOnly } from "src/utils/ToDateOnly";


export class CreateTraceProjectDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Name:string;

    // @ApiProperty()
    // @Transform(({ value }) => toDateOnly(value))
    // @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    //     message: 'date debe ser YYYY-MM-DD',
    // })
    // @IsOptional()
    // date?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Observation:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    ProjectId:number;
}
