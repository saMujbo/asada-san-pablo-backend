import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty({ message: 'La ubicación es obligatoria' })
  @Length(1, 255, { message: 'La ubicación debe tener entre 1 y 255 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ApiProperty({ example: 'San Pablo', description: 'Ubicación del reporte' })
  Location: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @Length(1, 255, { message: 'La descripción debe tener entre 1 y 255 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ApiProperty({ example: 'Fuga de agua en la tubería principal', description: 'Descripción del reporte' })
  Description: string;

  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiProperty({ example: 1, description: 'ID del usuario que crea el reporte' })
  UserId: number;

  @IsNotEmpty({ message: 'El ID de la ubicación es obligatorio' })
  @IsInt({ message: 'El ID de la ubicación debe ser un número entero' })
  @Min(1, { message: 'El ID de la ubicación debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiProperty({ example: 1, description: 'ID de la ubicación (report_locations)' })
  LocationId: number;

  @IsNotEmpty({ message: 'El ID del tipo de reporte es obligatorio' })
  @IsInt({ message: 'El ID del tipo de reporte debe ser un número entero' })
  @Min(1, { message: 'El ID del tipo de reporte debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiProperty({ example: 1, description: 'ID del tipo de reporte' })
  ReportTypeId: number;

  @IsOptional()
  @IsInt({ message: 'El ID del estado debe ser un número entero' })
  @Min(1, { message: 'El ID del estado debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiPropertyOptional({ example: 1, description: 'ID del estado del reporte' })
  ReportStateId?: number;

  @IsOptional()
  @IsInt({ message: 'El ID del usuario encargado debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario encargado debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiPropertyOptional({ example: 2, description: 'ID del usuario encargado del reporte' })
  UserInChargeId?: number;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'La información adicional no puede superar 255 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @ApiPropertyOptional({ example: 'Detalles adicionales', description: 'Información adicional del reporte' })
  AdditionalInfo?: string;
}
