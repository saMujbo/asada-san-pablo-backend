import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMaterialDto {
    @ApiProperty()
    @IsString()
    nombre: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    unidadMedida: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    tipo?: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
