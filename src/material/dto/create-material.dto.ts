import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

    export class CreateMaterialDto {
    @ApiProperty()
    @IsString()
    Name: string;

    @IsString()
    @ApiProperty()
    Description: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    IsActive?: boolean; 

    @ApiProperty()
    @IsString()
    Unit:string;
    }
