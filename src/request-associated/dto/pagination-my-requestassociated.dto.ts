// src/request-availability-water/dto/pagination-my-requests.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class PaginationMyRequestsAssociatedDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'ID del estado de la solicitud' })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsInt()
  StateRequestId?: number;

  @ApiPropertyOptional({ description: 'Búsqueda en Justification (y opcionalmente en User.Name)' })
  @IsOptional()
  @IsString()
  q?: string;
}
