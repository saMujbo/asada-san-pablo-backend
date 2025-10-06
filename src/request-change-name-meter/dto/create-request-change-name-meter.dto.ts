import { IsOptional, IsString, IsArray, IsBoolean, IsInt, IsPositive, IsNotEmpty } from "class-validator";

    export class CreateRequestChangeNameMeterDto {
    @IsOptional()
    @IsString()
    Justification?: string;

    // Archivos (URLs o paths) — opcionales
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    IdCardFiles?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    PlanoPrintFiles?: string[];

    @IsOptional()
    @IsString()
    LiteralCertificateFile?: string;

    // Por si quieres setearlo manualmente (en la entidad default = true)
    @IsOptional()
    @IsBoolean()
    IsActive?: boolean;

    // FK requeridas
    @IsInt()
    @IsNotEmpty()
    UserId: number;

    @IsInt()
    @IsNotEmpty()
    StateRequestId: number;
    }
