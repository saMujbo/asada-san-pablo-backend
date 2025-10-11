// src/reports/dto/create-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'San Pablo', description: 'Location of the report' })
  @IsString()
  @IsNotEmpty()
  Location: string;
}
