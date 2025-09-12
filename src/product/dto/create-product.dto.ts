import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty()
    @IsString() @IsNotEmpty()
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
    @IsInt() @Min(1)
    SupplierId: number;
}