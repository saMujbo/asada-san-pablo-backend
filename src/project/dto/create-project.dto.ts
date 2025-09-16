import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsDateString, IsOptional, Matches, IsArray, ArrayUnique, ArrayMinSize, IsInt, Min, ValidateNested } from "class-validator";
import { toDateOnly } from "src/utils/ToDateOnly";

export class ProductWithQtyDto {
    @ApiProperty()
    @IsInt()
    @Min(1)
    productId: number;

    @ApiProperty()
    @IsInt()
    @Min(1)
    quantity: number;
}


export class CreateProjectDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Location: string;

    @ApiProperty()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    InnitialDate: string;

    @ApiProperty()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    @IsOptional()
    EndDate?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Objective: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Description: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    Observation?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    SpaceOfDocument?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    ProjectStateId: number;

    @ApiPropertyOptional({ type: [ProductWithQtyDto] })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ProductWithQtyDto)
    productQuantitys?: ProductWithQtyDto[];
}
