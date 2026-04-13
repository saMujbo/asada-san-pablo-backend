import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class ProductPaginationDto extends PaginationQueryDto {
    @ApiPropertyOptional({ description: 'Filtro por texto. Compatible con el front actual.' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => {
        if (typeof value !== 'string') return undefined;
        const v = value.trim();
        return v.length ? v : undefined;
    })
    name?: string;

    @ApiPropertyOptional({ description: 'Campo por el cual ordenar: name, type, category o supplier' })
    @IsOptional()
    @IsIn(['name', 'type', 'category', 'supplier'])
    sortBy?: 'name' | 'type' | 'category' | 'supplier';

    @ApiPropertyOptional({ description: 'ID de categoria para filtrar' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Transform(({ value }) => (value === '' || value === null ? undefined : value))
    categoryId?: number;

    @ApiPropertyOptional({ description: 'ID de material para filtrar' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Transform(({ value }) => (value === '' || value === null ? undefined : value))
    materialId?: number;

    @ApiPropertyOptional({ description: 'ID de unidad para filtrar' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Transform(({ value }) => (value === '' || value === null ? undefined : value))
    unitId?: number;

    @ApiPropertyOptional({ description: 'ID de proveedor para filtrar' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Transform(({ value }) => (value === '' || value === null ? undefined : value))
    supplierId?: number;

    @ApiPropertyOptional({ description: 'Filtro por estado activo (true o false)' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    state?: boolean;
}
