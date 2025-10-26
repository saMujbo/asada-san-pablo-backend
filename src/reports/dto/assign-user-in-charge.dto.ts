import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignUserInChargeDto {
  @ApiProperty({ example: 1, description: 'ID del reporte al que se asignará el usuario' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  reportId: number;

  @ApiProperty({ example: 2, description: 'ID del usuario que será asignado como encargado' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  userInChargeId: number;
}