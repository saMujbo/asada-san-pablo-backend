import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

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
        description: 'Búsqueda por texto en descripción, ubicación o información adicional',
        example: 'fuga',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined))
    search?: string;

    @ApiPropertyOptional({
        description: 'Filtra por estado del reporte (ReportStateId)',
        example: 2,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === undefined) return undefined;
        const n = Number(value);
        return Number.isInteger(n) && n >= 1 ? n : undefined;
    })
    @IsInt()
    @Min(1)
    stateId?: number;

    @ApiPropertyOptional({
        description: 'Filtra por ubicación (LocationId de report_locations)',
        example: 1,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === undefined) return undefined;
        const n = Number(value);
        return Number.isInteger(n) && n >= 1 ? n : undefined;
    })
    @IsInt()
    @Min(1)
    locationId?: number;

    @ApiPropertyOptional({
        description: 'Filtra por tipo de reporte (ReportTypeId)',
        example: 1,
    })
    @IsOptional()
    @Transform(({ value, obj }) => {
        const v = value ?? obj?.ReportTypeId ?? obj?.reportTypeId;
        if (v === '' || v === undefined) return undefined;
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 ? n : undefined;
    })
    @IsInt()
    @Min(1)
    reportTypeId?: number;
}
