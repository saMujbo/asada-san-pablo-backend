import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  Matches,
  IsBoolean,
  IsInt,
  MaxLength,
  Min,
} from "class-validator";
import { toDateOnly } from "src/utils/ToDateOnly";

export class UpdateProjectDto {
    @ApiPropertyOptional({ example: "Proyecto Acueducto San Pablo" })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "El nombre del proyecto debe ser un texto" })
    @MaxLength(255, { message: "El nombre del proyecto no puede superar los 255 caracteres" })
    Name?: string;

    @ApiPropertyOptional({ example: "San Pablo de Heredia, costado norte del tanque" })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "La ubicación debe ser un texto" })
    @MaxLength(500, { message: "La ubicación no puede superar los 500 caracteres" })
    Location?: string;

    @ApiPropertyOptional({ example: "2026-03-23", description: "Fecha de inicio en formato YYYY-MM-DD" })
    @IsOptional()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha inicial debe tener el formato YYYY-MM-DD',
    })
    InnitialDate?: string;

    @ApiPropertyOptional({ example: "2026-12-31", description: "Fecha de finalización en formato YYYY-MM-DD" })
    @IsOptional()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha final debe tener el formato YYYY-MM-DD',
    })
    EndDate?: string;

    @ApiPropertyOptional({
        example: "<p>Mejorar la distribución del agua potable en la comunidad</p>",
        description: "Objetivo del proyecto. Acepta texto plano o HTML.",
    })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "El objetivo debe ser un texto" })
    @MaxLength(5000, { message: "El objetivo no puede superar los 5000 caracteres" })
    Objective?: string;

    @ApiPropertyOptional({
        example: "<p>Construcción de nueva línea de conducción y mejoras en captación</p>",
        description: "Descripción del proyecto. Acepta texto plano o HTML.",
    })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "La descripción debe ser un texto" })
    @MaxLength(10000, { message: "La descripción no puede superar los 10000 caracteres" })
    Description?: string;

    @ApiPropertyOptional({
        example: "<p>Se requiere coordinación con la municipalidad</p>",
        description: "Observaciones adicionales. Acepta texto plano o HTML.",
    })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "La observación debe ser un texto" })
    @MaxLength(5000, { message: "La observación no puede superar los 5000 caracteres" })
    Observation?: string;

    @ApiPropertyOptional({ example: "/Proyectos/Acueducto/Documentacion" })
    @IsOptional()
    @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
    @IsString({ message: "El espacio de documentos debe ser un texto" })
    @MaxLength(1000, { message: "El espacio de documentos no puede superar los 1000 caracteres" })
    SpaceOfDocument?: string;

    @ApiPropertyOptional({ example: 1, description: "ID del estado del proyecto" })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El estado del proyecto debe ser un número entero" })
    @Min(1, { message: "El estado del proyecto debe ser mayor a 0" })
    ProjectStateId?: number;

    @ApiPropertyOptional({ example: 12, description: "ID del usuario responsable" })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El usuario responsable debe ser un número entero" })
    @Min(1, { message: "El usuario responsable debe ser mayor a 0" })
    UserId?: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    CanComment?: boolean;
}
