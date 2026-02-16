import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreateProductDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    Name: string;

    @ApiProperty()
    @IsString() @IsNotEmpty()
    Type: string;

    @ApiProperty()
    @IsString() @IsOptional()
    Observation: string;

    @ApiProperty()
    @IsInt() @Min(1)
    CategoryId: number;

    @ApiProperty()
    @IsInt() @Min(1)
    MaterialId: number;

    @ApiProperty()
    @IsInt() @Min(1)
    UnitMeasureId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt({ each: true })
    @Min(1, { each: true })
    SuppliersIds: number[];
}