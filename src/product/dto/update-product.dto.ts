import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty()
    @IsOptional() @IsInt() @Min(1)
    CategoryId?: number;

    @ApiProperty()
    @IsOptional() @IsInt() @Min(1)
    MaterialId?: number;

    @ApiProperty()
    @IsOptional() @IsInt() @Min(1)
    UnitMeasureId?: number;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;
}