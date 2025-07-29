import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
        @IsNotEmpty()
        @IsString()
        nombre:string;
    
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        apellidos:string;
    
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        cedula: string;
    
        @ApiProperty()
        @IsString()
        nis?: string;
    
        @ApiProperty()
        @IsNotEmpty()
        @IsEmail()
        email: string;
    
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        telefono: string;
    
        @ApiProperty({
        type: String,
        format: 'date',
        example: '1995-07-29',
        })
        @IsNotEmpty()
        @IsDate()
        fechaNacimiento: Date;
    
        @ApiProperty()
        @IsNotEmpty()
        @MinLength(4)
        @MaxLength(12)
        password: string;
    
        // @ApiProperty()
        // @IsNotEmpty()
        // @MinLength(4)
        // @MaxLength(12)
        // confirmPassword: string;
}
