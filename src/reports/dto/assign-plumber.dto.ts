import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';

export class AssignPlumberDto {
  @ApiProperty({ example: 12, description: 'ID del usuario con rol FONTANERO que quedará a cargo del reporte' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  plumberUserId: number;

  @ApiPropertyOptional({ example: 'Revisar la fuga, aislar el tramo y corregir la conexión dañada.' })
  @IsOptional()
  @Length(0, 500, { message: 'Las instrucciones deben tener como máximo 500 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  instructions?: string;
}
