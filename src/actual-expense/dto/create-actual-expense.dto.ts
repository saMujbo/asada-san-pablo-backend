import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, Matches } from "class-validator";
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
}
