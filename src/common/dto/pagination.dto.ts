import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Filtro por nombre o apellidos (LIKE)' })
  @IsOptional()
  @IsString()
  // convierte "" en undefined y hace trim
  @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const v = value.trim();
    return v.length ? v : undefined;
  })
  name?: string;

  @ApiPropertyOptional({ description: 'ID de rol para filtrar' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  // convierte "" en undefined
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  roleId?: number;
}
