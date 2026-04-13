import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({example: 'Fontanería'})
    @IsString({message: 'El nombre de la categoría debe ser una cadena de texto'}) 
    @IsNotEmpty({message: 'El nombre de la categoría es requerido'})
    Name: string;

    @IsOptional()
    @IsString({message: 'La descripción de la categoría debe ser una cadena de texto'})
    @ApiProperty({example: 'Categoría para productos de fontanería'})
    Description?: string;
}
