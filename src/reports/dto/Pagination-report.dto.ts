import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class ReportsPaginationDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @ApiPropertyOptional({
        description: 'Filtra por estado del reporte (ReportStateId)',
        example: 2,
    })
    @IsOptional()
    @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
    @IsInt()
    @Min(1)
    stateId?: number;

    @ApiPropertyOptional({
        description: 'Filtra por ubicación (LocationId de report_locations)',
        example: 1,
    })
    @IsOptional()
    @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
    @IsInt()
    @Min(1)
    locationId?: number;

    // tambien por tipo de reporte
    @ApiPropertyOptional({
        description: 'Filtra por tipo de reporte (ReportTypeId)',
        example: 1,
    })
    @IsOptional()
    @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
    @IsInt()
    @Min(1)
    ReportTypeId?: number;
}
