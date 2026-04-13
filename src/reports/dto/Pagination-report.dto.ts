import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { ReportStateEnum } from '../enums/report-state.enum';

export class ReportsPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra por estado del reporte',
    enum: ReportStateEnum,
    example: ReportStateEnum.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(ReportStateEnum, { message: 'El estado del reporte no es válido' })
  state?: ReportStateEnum;

  @ApiPropertyOptional({
    description: 'Filtra por ubicación (ReportLocationId)',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.locationId ?? obj?.ReportLocationId ?? obj?.reportLocationId;
    if (v === '' || v === undefined) return undefined;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 ? n : undefined;
  })
  @IsInt()
  @Min(1)
  reportLocationId?: number;

  @ApiPropertyOptional({
    description: 'Filtra por tipo de reporte (ReportTypeId)',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.ReportTypeId ?? obj?.reportTypeId;
    if (v === '' || v === undefined) return undefined;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 ? n : undefined;
  })
  @IsInt()
  @Min(1)
  reportTypeId?: number;

  @ApiPropertyOptional({
    description: 'Filtra por fontanero asignado',
    example: 7,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined) return undefined;
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 ? n : undefined;
  })
  @IsInt()
  @Min(1)
  plumberUserId?: number;

  @ApiPropertyOptional({
    description: 'Fecha desde (inclusive). Formato ISO 8601 (ej: 2026-01-01)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (inclusive). Formato ISO 8601 (ej: 2026-12-31)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
