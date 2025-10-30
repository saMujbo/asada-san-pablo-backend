import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class CreateFAQDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty() 
    Question:string

    @ApiProperty()
    @IsString()
    @IsNotEmpty() 
    Answer:string
}
