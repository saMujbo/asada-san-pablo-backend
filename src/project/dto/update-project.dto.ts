import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsString, Matches, IsBoolean, IsArray, ArrayUnique, IsInt, ArrayMinSize, ValidateNested } from "class-validator";
import { toDateOnly } from "src/utils/ToDateOnly";
import { ProductWithQtyDto } from "./create-project.dto";

export class UpdateProjectDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    Name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    Location?: string;

    @ApiPropertyOptional()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    @IsOptional()
    InnitialDate?: string;

    @ApiPropertyOptional()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    @IsOptional()
    EndDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    Objective?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    Description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    Observation?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    SpaceOfDocument?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    ProjectStateId?: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;

    @ApiPropertyOptional({ type: [ProductWithQtyDto] })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ProductWithQtyDto)
    productQuantitys?: ProductWithQtyDto[];
}
