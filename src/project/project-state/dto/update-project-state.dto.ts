import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateProjectStateDto {
    @ApiPropertyOptional({ description: 'Nombre del estado del proyecto' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    Name?: string;

    @ApiPropertyOptional({ description: 'Descripción del estado del proyecto' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    Description?: string;

    @ApiPropertyOptional({ description: 'Indica si el estado está activo' })
    @IsOptional()
    @IsBoolean()
    IsActive?: boolean;
}