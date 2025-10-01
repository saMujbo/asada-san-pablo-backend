import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsInt, Min } from "class-validator";

    export class CreateAgentSupplierDto {
    @ApiProperty({ example: 'Juan' })
    @IsString()
    @IsNotEmpty()
    Name: string;

    @ApiProperty({ example: 'Pérez' })
    @IsString()
    @IsNotEmpty()
    Surname1: string;

    @ApiProperty({ example: 'Gómez' })
    @IsString()
    @IsNotEmpty()
    Surname2: string;

    @ApiProperty({ example: 'juanperez@email.com' })
    @IsEmail()
    @IsNotEmpty()
    Email: string;

    @ApiProperty({ example: '+50688887777' })
    @IsString()
    @IsNotEmpty()
    PhoneNumber: string;

    @ApiProperty()
    @IsInt() @Min(1)
    @IsNotEmpty()
    LegalSupplierId: number;
}
