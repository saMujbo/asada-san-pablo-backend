import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreateProductDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'Name no debe estar vacio' })
    @IsString({ message: 'Name debe ser un texto' })
    Name: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsString({ message: 'Type debe ser un texto' })
    @IsNotEmpty({ message: 'Type no debe estar vacio' })
    Type: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsString({ message: 'Observation debe ser un texto' })
    @IsOptional()
    Observation?: string;

    @ApiProperty()
    @Type(() => Number)
    @IsInt({ message: 'CategoryId debe ser un numero entero' })
    @Min(1, { message: 'CategoryId debe ser mayor o igual a 1' })
    CategoryId: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt({ message: 'MaterialId debe ser un numero entero' })
    @Min(1, { message: 'MaterialId debe ser mayor o igual a 1' })
    MaterialId: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt({ message: 'UnitMeasureId debe ser un numero entero' })
    @Min(1, { message: 'UnitMeasureId debe ser mayor o igual a 1' })
    UnitMeasureId: number;

    @ApiProperty({ type: [Number] })
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
    @IsNotEmpty({ message: 'SuppliersIds es requerido' })
    SuppliersIds: number[];
}
