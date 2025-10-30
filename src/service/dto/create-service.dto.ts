import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateServiceDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty() 
    Icon:string

    @ApiProperty()
    @IsString()
    @IsNotEmpty() 
    Title:string

    @ApiProperty()
    @IsString()
    @IsNotEmpty() 
    Description:string
}
