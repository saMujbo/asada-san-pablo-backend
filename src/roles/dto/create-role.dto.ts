import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ example: 'ADMIN' })
    @IsString()
    @IsNotEmpty()
    Rolname: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Description: string;
}
