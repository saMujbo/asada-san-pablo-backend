import { PartialType } from "@nestjs/mapped-types";
import { LoginAuthDto } from "./login-auth.dto";
import { IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterAuth extends PartialType(LoginAuthDto){ 
    @ApiProperty()
    @IsString()
      @IsNotEmpty()
      IDcard: string;
    
      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      Name: string;
    
      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      Surname1: string;
    
      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      Surname2: string;
    
      @ApiProperty()
      @IsOptional()
      @IsString()
      Nis?: string;
    
      @ApiProperty()
      @IsEmail()
      @IsNotEmpty()
      Email: string;
    
      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      @Matches(/^[0-9]{8}$/, { message: 'PhoneNumber debe tener 8 dígitos numéricos' })
      PhoneNumber: string;
    
      @ApiProperty()
      @IsDateString()
      @IsNotEmpty()
      Birthdate: Date;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(12)
    Password: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(12)
    ConfirmPassword: string;
}