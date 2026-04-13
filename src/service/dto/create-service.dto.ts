import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { TrimAndNullify } from "src/utils/validation.utils";

export class CreateServiceDto {
    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty() 
    Icon:string

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty() 
    Title:string

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty() 
    Description:string
}
