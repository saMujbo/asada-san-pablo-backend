import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsInt } from "class-validator";
import { TrimAndNullify } from "src/utils/validation.utils";

export class CreateTraceProjectDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsString({ message: 'El nombre del seguimiento debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre del seguimiento es requerido' })
    Name:string;

    @ApiProperty()
    @TrimAndNullify()
    @IsString({ message: 'La observacion del seguimiento debe ser un texto' })
    @IsNotEmpty({ message: 'La observacion del seguimiento es requerida' })
    Observation:string;

    @ApiProperty()
    @Type(() => Number)
    @IsNotEmpty({ message: 'El proyecto es requerido' })
    @IsInt({ message: 'El proyecto debe ser un ID numerico valido' })
    ProjectId:number;
}
