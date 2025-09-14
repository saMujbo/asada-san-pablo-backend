    import { ApiPropertyOptional } from '@nestjs/swagger';
    import { Transform, Type } from 'class-transformer';
    import { IsInt, Min, Max, IsOptional, IsString, IsBoolean } from 'class-validator';

    export class SupplierPaginationDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @ApiPropertyOptional({ description: 'Filtro por nombre de proveedor' })
    @IsOptional()
    @IsString()
    Name?: string;

    @ApiPropertyOptional({ description: 'Filtro por correo electrónico de proveedor' })
    @IsOptional()
    Email?: string;

    
    @ApiPropertyOptional({ description: 'Filtro por número telefónico de proveedor' })
    @IsOptional()
    @IsString()
    PhoneNumber?: string;

    
    @ApiPropertyOptional({ description: 'Filtro por ubicación de proveedor' })
    @IsOptional()
    Location?: string;

    @ApiPropertyOptional({ description: 'Filtro por estado (true/false)' })
    @IsOptional()
    @IsString()
    state?: string;
}
