import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class CreateUnitMeasureDto {
    @ApiProperty()
    @IsString() 
    Name:string; // falta definir validaciones de tamaño y demás
}
