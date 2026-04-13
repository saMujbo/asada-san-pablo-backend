import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsInt,
  MaxLength,
  Min,
} from "class-validator";
import { toDateOnly } from "src/utils/ToDateOnly";

export class CreateProjectDto {
    @ApiProperty({ example: "Proyecto Acueducto San Pablo" })
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "El nombre del proyecto debe ser un texto" })
    @IsNotEmpty({ message: "El nombre del proyecto es obligatorio" })
    @MaxLength(255, { message: "El nombre del proyecto no puede superar los 255 caracteres" })
    Name: string;

    @ApiProperty({ example: "San Pablo de Heredia, costado norte del tanque" })
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "La ubicación debe ser un texto" })
    @IsNotEmpty({ message: "La ubicación es obligatoria" })
    @MaxLength(500, { message: "La ubicación no puede superar los 500 caracteres" })
    Location: string;

    @ApiProperty({ example: "2026-03-23", description: "Fecha de inicio en formato YYYY-MM-DD" })
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha inicial debe tener el formato YYYY-MM-DD',
    })
    @IsNotEmpty({ message: "La fecha inicial es obligatoria" })
    InnitialDate: string;

    @ApiPropertyOptional({ example: "2026-12-31", description: "Fecha de finalización en formato YYYY-MM-DD" })
    @IsOptional()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha final debe tener el formato YYYY-MM-DD',
    })
    EndDate?: string;

    @ApiProperty({
        example: "<p>Mejorar la distribución del agua potable en la comunidad</p>",
        description: "Objetivo del proyecto. Acepta texto plano o HTML.",
    })
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "El objetivo debe ser un texto" })
    @IsNotEmpty({ message: "El objetivo es obligatorio" })
    @MaxLength(8000, { message: "El objetivo no puede superar los 8000 caracteres (incluyendo formato HTML)" })
    Objective: string;

    @ApiProperty({
        example: "<p>Construcción de nueva línea de conducción y mejoras en captación</p>",
        description: "Descripción del proyecto. Acepta texto plano o HTML.",
    })
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "La descripción debe ser un texto" })
    @IsNotEmpty({ message: "La descripción es obligatoria" })
    @MaxLength(20000, { message: "La descripción no puede superar los 20000 caracteres (incluyendo formato HTML)" })
    Description: string;

    @ApiPropertyOptional({
        example: "<p>Se requiere coordinación con la municipalidad</p>",
        description: "Observaciones adicionales. Acepta texto plano o HTML.",
    })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "La observación debe ser un texto" })
    @MaxLength(10000, { message: "La observación no puede superar los 10000 caracteres (incluyendo formato HTML)" })
    Observation?: string;

    @ApiPropertyOptional({ example: "/Proyectos/Acueducto/Documentacion" })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "El espacio de documentos debe ser un texto" })
    @MaxLength(1000, { message: "El espacio de documentos no puede superar los 1000 caracteres" })
    SpaceOfDocument?: string;

    @ApiProperty({ example: 1, description: "ID del estado del proyecto" })
    @Type(() => Number)
    @IsNotEmpty({ message: "El estado del proyecto es obligatorio" })
    @IsInt({ message: "El estado del proyecto debe ser un número entero" })
    @Min(1, { message: "El estado del proyecto debe ser mayor a 0" })
    ProjectStateId: number;

    @ApiProperty({ example: 12, description: "ID del usuario responsable" })
    @Type(() => Number)
    @IsNotEmpty({ message: "El usuario responsable es obligatorio" })
    @IsInt({ message: "El usuario responsable debe ser un número entero" })
    @Min(1, { message: "El usuario responsable debe ser mayor a 0" })
    UserId: number;
}
