import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    Name: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    Type: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    Observation: string;

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