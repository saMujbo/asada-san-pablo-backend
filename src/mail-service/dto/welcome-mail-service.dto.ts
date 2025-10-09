import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class WelcomeMailASADADto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    to:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    subject:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Name:string;

    @ApiProperty()
    @IsString()
    message?:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    LoginURL: string;
}
