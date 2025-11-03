import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateReportDto } from './create-report.dto';
import { IsOptional, MinLength } from 'class-validator';

export class UpdateReportDto extends PartialType(CreateReportDto) {
    @ApiPropertyOptional({ example: 'Additional details about the report', description: 'Additional information for the report' })
    @IsOptional()
    @MinLength(5, { message: 'AdditionalInfo must be at least 5 characters long' })
    AdditionalInfo?: string;
}