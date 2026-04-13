import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Length, Min } from 'class-validator';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiPropertyOptional({ example: 'Detrás de la escuela, cerca de la esquina norte' })
  @IsOptional()
  @Length(1, 255, { message: 'La ubicación exacta debe tener entre 1 y 255 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  ExactLocation?: string;

  @ApiPropertyOptional({ example: 'La fuga aumentó y afecta la acera' })
  @IsOptional()
  @Length(1, 255, { message: 'La descripción debe tener entre 1 y 255 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  Description?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt({ message: 'El ID de la ubicación debe ser un número entero' })
  @Min(1, { message: 'El ID de la ubicación debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  ReportLocationId?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt({ message: 'El ID del tipo de reporte debe ser un número entero' })
  @Min(1, { message: 'El ID del tipo de reporte debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  ReportTypeId?: number;
}
