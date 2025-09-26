import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Matches } from "class-validator";
import { TraceProject } from "src/trace-project/entities/trace-project.entity";
import { toDateOnly } from "src/utils/ToDateOnly";
import { Column, PrimaryGeneratedColumn } from "typeorm";

export class CreateActualExpenseDto {

    @ApiProperty()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'date debe ser YYYY-MM-DD',
    })
    Date: string;

    @ApiProperty()
    @IsString() 
    Observation: string;

    @ApiProperty()
    @IsOptional()
    @Type(()=> Number)
    @IsInt()
    TraceProjectId: number;
}
