import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class UpdateProductDto {

    @ApiProperty()
    @IsOptional()
    @TrimAndNullify()
    @IsString({ message: 'Name debe ser un texto' })
    Name: string;
    
    @ApiProperty()
    @IsOptional()
    @TrimAndNullify()
    @IsString({ message: 'Type debe ser un texto' })
    Type: string;
    
    @ApiProperty()
    @IsOptional()
    @TrimAndNullify()
    @IsString({ message: 'Observation debe ser un texto' })
    Observation?: string;

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'CategoryId debe ser un numero entero' })
    @Min(1, { message: 'CategoryId debe ser mayor o igual a 1' })
    CategoryId?: number;

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'MaterialId debe ser un numero entero' })
    @Min(1, { message: 'MaterialId debe ser mayor o igual a 1' })
    MaterialId?: number;

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'UnitMeasureId debe ser un numero entero' })
    @Min(1, { message: 'UnitMeasureId debe ser mayor o igual a 1' })
    UnitMeasureId?: number;

    @ApiProperty({ type: [Number] })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((item) => Number(item.trim())).filter((item) => !Number.isNaN(item));
        }
        return value;
    })
    @IsArray({ message: 'SuppliersIds debe ser un arreglo' })
    @ArrayMinSize(1, { message: 'SuppliersIds debe contener al menos un proveedor' })
    @ArrayUnique({ message: 'SuppliersIds no debe contener proveedores repetidos' })
    @Type(() => Number)
    @IsInt({ each: true, message: 'Cada valor de SuppliersIds debe ser un numero entero' })
    @Min(1, { each: true, message: 'Cada valor de SuppliersIds debe ser mayor o igual a 1' })
    SuppliersIds?: number[];

    @ApiProperty()
    @IsBoolean({ message: 'IsActive debe ser un valor booleano' })
    @IsOptional()
    IsActive?: boolean;
}
