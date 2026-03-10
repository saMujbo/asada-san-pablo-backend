import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUnitMeasureDto {
  @ApiProperty({ example: 'Metros' })
  @IsString({ message: 'El nombre de la unidad de medida debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la unidad de medida es requerido' })
  Name: string;
}
