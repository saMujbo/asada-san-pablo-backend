import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, Length } from 'class-validator';
import { ReportStateEnum } from '../enums/report-state.enum';

export class ChangeReportStateDto {
  @ApiProperty({ enum: ReportStateEnum, example: ReportStateEnum.EN_PROCESO })
  @IsEnum(ReportStateEnum, { message: 'El nuevo estado no es válido' })
  newState: ReportStateEnum;

  @ApiProperty({ example: 'Se asignó personal técnico y se inició la atención del caso.' })
  @IsNotEmpty({ message: 'La razón del cambio es obligatoria' })
  @Length(1, 500, { message: 'La razón del cambio debe tener entre 1 y 500 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  reasonChange: string;
}
