import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsString, Matches, IsBoolean, IsArray, ArrayUnique, IsInt, ArrayMinSize, ValidateNested, IsNotEmpty } from "class-validator";
import { toDateOnly } from "src/utils/ToDateOnly";

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

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    UserId: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    CanComment?: boolean;
}
