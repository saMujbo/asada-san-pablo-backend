import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class ReportsPaginationDto extends PaginationQueryDto {
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
