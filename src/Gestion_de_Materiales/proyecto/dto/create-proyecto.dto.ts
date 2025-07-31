import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateProyectoDto {
    @ApiProperty()
    @IsString()
    nombre: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty()
    @IsDateString()
    fechaInicio: string;

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    estado?: string; // Ej: planificado, en ejecucion, finalizado
}

