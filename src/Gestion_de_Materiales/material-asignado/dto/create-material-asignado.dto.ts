import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateMaterialAsignadoDto {

    @ApiProperty()
    @IsInt()
    MaterialId: number;

    @ApiProperty()
    @IsInt()
    ProyectoId: number;

    @ApiProperty()
    @IsDateString()
    FechaAsignacion: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    Observations?: string;
}
