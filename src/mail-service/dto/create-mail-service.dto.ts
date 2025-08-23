import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateMailServiceDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    to:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    subject:string;

    @ApiProperty()
    @IsString()
    message?:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    RecoverPasswordURL: string;
}
