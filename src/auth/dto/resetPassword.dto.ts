import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class resetPasswordDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    NewPassword:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    ConfirmPassword:string;
}