import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Length, Min } from 'class-validator';

export class AssignPlumberDto {
  @ApiProperty({ example: 12, description: 'ID del usuario con rol FONTANERO que quedará a cargo del reporte' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  plumberUserId: number;

  @ApiProperty({ example: 'Revisar la fuga, aislar el tramo y corregir la conexión dañada.' })
  @IsNotEmpty({ message: 'Las instrucciones son obligatorias' })
  @Length(1, 500, { message: 'Las instrucciones deben tener entre 1 y 500 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  instructions: string;
}
