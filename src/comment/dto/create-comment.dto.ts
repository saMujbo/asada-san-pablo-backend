import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsString({message: 'Message debe ser un texto'} )
    @IsNotEmpty({message: 'Message no debe estar vacio'} )
    @MaxLength(300, {message: 'Message no puede superar los 300 caracteres'} )
    Message: string;
}
