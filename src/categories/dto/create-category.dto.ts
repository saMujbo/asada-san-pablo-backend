import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Name: string; // faltan validaciones

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Description: string; // faltan validaciones 
}
