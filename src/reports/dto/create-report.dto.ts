// src/reports/dto/create-report.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

  @ApiPropertyOptional({ example: 1, description: 'State ID of the report' })
  @IsOptional()
  @IsInt()
  ReportStateId?: number;

  @ApiPropertyOptional({ example: 2, description: 'User ID of the person in charge of the report' })
  @IsOptional()
  @IsInt()
  UserInChargeId?: number;
}
