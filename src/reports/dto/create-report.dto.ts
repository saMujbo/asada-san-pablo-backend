import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Length, Min } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty({ message: 'La ubicación exacta es obligatoria' })
  @Length(1, 255, { message: 'La ubicación exacta debe tener entre 1 y 255 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ApiProperty({ example: 'Frente al hidrante principal, casa color azul', description: 'Referencia exacta del lugar reportado' })
  ExactLocation: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @Length(1, 255, { message: 'La descripción debe tener entre 1 y 255 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ApiProperty({ example: 'Fuga de agua en la tubería principal', description: 'Descripción del reporte' })
  Description: string;

  @IsNotEmpty({ message: 'El usuario del catálogo es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiProperty({ example: 1, description: 'ID del usuario que reporta' })
  UserId: number;

  @IsNotEmpty({ message: 'La ubicación del catálogo es obligatoria' })
  @IsInt({ message: 'El ID de la ubicación debe ser un número entero' })
  @Min(1, { message: 'El ID de la ubicación debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiProperty({ example: 1, description: 'ID de la ubicación del reporte (report_locations)' })
  ReportLocationId: number;

  @IsNotEmpty({ message: 'El tipo de reporte es obligatorio' })
  @IsInt({ message: 'El ID del tipo de reporte debe ser un número entero' })
  @Min(1, { message: 'El ID del tipo de reporte debe ser mayor a 0' })
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @ApiProperty({ example: 1, description: 'ID del tipo de reporte' })
  ReportTypeId: number;
}
