import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateReportLocationDto } from './create-report-location.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReportLocationDto extends PartialType(CreateReportLocationDto) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    IsActive?: boolean;
}
