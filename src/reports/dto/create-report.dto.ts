// src/reports/dto/create-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'San Pablo', description: 'Location of the report' })
  @IsString()
  @IsNotEmpty()
  Location: string;

  @ApiProperty({ example: 'A report description', description: 'Description of the report' })
  @IsString()
  @IsNotEmpty()
  Description: string;

  @ApiProperty({ example: 1, description: 'User ID of the report creator' })
  @IsNotEmpty()
  @IsInt()
  UserId: number;  // Añadir UserId al DTO

  @ApiProperty({ example: 1, description: 'Location ID of the report' })
  @IsNotEmpty()
  @IsInt()
  LocationId: number;

  @ApiProperty({ example: 1, description: 'Type ID of the report' })
  @IsNotEmpty()
  @IsInt()
  ReportTypeId: number;

  @ApiProperty({ example: 1, description: 'State ID of the report' })
  @IsNotEmpty()
  @IsInt()
  ReportStateId: number;

  @ApiProperty({ example: 2, description: 'User ID of the person in charge of the report', required: false })
  @IsInt()
  UserInChargeId: number;
}
