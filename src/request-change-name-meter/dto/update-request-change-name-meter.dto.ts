import { PartialType } from '@nestjs/swagger';
import { CreateRequestChangeNameMeterDto } from './create-request-change-name-meter.dto';
import { IsOptional, IsString, IsArray, IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRequestChangeNameMeterDto{
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
