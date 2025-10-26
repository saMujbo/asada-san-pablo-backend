import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignUserDto {
  @ApiProperty({ example: 2, description: 'ID del usuario que será asignado como encargado' })
  @IsNotEmpty()
  @IsInt()
  userInChargeId: number;
}