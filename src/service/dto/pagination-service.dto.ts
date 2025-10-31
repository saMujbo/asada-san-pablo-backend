import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ServicePaginationDto {
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

    @ApiPropertyOptional({ description: 'Filtro por titulo (LIKE)' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const v = value.trim();
    return v.length ? v : undefined;
    })
    title?: string;
    
    @ApiPropertyOptional({ description: 'Filtro por estado (true/false)' })
    @IsOptional()
    @IsString()
    state?: string;
}