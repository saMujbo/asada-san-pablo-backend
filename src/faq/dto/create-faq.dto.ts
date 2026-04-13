import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"
import { TrimAndNullify } from "src/utils/validation.utils"

export class CreateFAQDto {
    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty() 
    Question:string

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty() 
    Answer:string
}
