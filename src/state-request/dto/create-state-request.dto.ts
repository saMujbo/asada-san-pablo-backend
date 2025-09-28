import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateStateRequestDto {

        @ApiProperty()
        @IsString()
        @IsNotEmpty()
        Name:string;

        @ApiProperty()
        @IsString()
        @IsNotEmpty()
        Description: string;

}
