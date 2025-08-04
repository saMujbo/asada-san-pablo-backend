import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MinLength, MaxLength, IsNotEmpty, IsString } from "class-validator";

export class ForgotPassword{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    IDcard: string;

    @ApiProperty()
    @IsEmail()
    Email:string;
}
