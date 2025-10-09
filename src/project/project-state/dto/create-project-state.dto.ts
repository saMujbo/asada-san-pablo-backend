import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectStateDto {
    @ApiProperty({ description: 'Nombre del estado del proyecto' })
    @IsString()
    @IsNotEmpty()
    Name: string;

    @ApiProperty({ description: 'Descripción del estado del proyecto' })
    @IsString()
    @IsNotEmpty()
    Description: string;
}