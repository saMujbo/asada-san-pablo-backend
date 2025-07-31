import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateMaterialAsignadoDto {

    @ApiProperty()
    @IsInt()
    materialId: number;

    @ApiProperty()
    @IsInt()
    proyectoId: number;

    @ApiProperty()
    @IsDateString()
    fechaAsignacion: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    observaciones?: string;
}
