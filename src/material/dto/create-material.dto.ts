import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateMaterialDto {
    @ApiProperty({example: 'Acero'})
    @IsString({message: 'El nombre del material debe ser una cadena de texto'})
    @IsNotEmpty({message: 'El nombre del material es requerido'})
    Name:string;
}
