import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangepasswordDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    OldPassword:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    NewPassword:string;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsString()
    // ConfirmPassword:string;
}