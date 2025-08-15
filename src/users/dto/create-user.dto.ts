import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  IDcard: string;

  @IsString()
  @IsNotEmpty()
  Name: string;

  @IsString()
  @IsNotEmpty()
  Surname1: string;

  @IsString()
  @IsNotEmpty()
  Surname2: string;

  @IsOptional()
  @IsString()
  Nis?: string;

  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{8}$/, { message: 'PhoneNumber debe tener 8 dígitos numéricos' })
  PhoneNumber: string;

  @IsDateString()
  @IsNotEmpty()
  Birthdate: Date;

  @IsString()
  @IsNotEmpty()
  Address: string;

  @IsString()
  @MinLength(6)
  Password: string;
}
