import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMaterialDto {
    @ApiProperty()
    @IsString()
    Name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    Description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    UnidadMedida: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    Type?: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    Active?: boolean;
}
