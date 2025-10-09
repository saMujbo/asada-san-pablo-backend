import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, Matches, IsInt} from "class-validator";
import { toDateOnly } from "src/utils/ToDateOnly";

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
    @IsNotEmpty()
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

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    UserId: number;
}
