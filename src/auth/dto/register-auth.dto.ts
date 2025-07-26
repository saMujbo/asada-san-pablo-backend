import { PartialType } from "@nestjs/mapped-types";
import { LoginAuthDto } from "./login-auth.dto";
import { IsDateString, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterAuth extends PartialType(LoginAuthDto){ 
    @IsNotEmpty()
    @IsString()
    nombre:string;

    @IsNotEmpty()
    @IsString()
    apellidos:string;

    @IsNotEmpty()
    @IsString()
    cedula: string;

    @IsString()
    nis?: string;

    @IsNotEmpty()
    @IsString()
    telefono: string;

    @IsNotEmpty()
    @IsDateString()
    fechaNacimiento: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(12)
    password: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(12)
    confirmPassword: string;
}