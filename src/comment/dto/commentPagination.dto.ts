import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CommentPaginationDto {
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

    @ApiPropertyOptional({description: 'Filtro por estado (true o false)'})
    @IsOptional()
    @IsString()
    read?: string;
}
