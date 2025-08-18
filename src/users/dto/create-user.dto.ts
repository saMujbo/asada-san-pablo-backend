import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';

export class CreateUserDto {
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
  @IsString()
  @IsNotEmpty()
  Address: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  Password: string;

  @ApiProperty({ type: [Role], required: false })
  Roles?: Role[]; // Opcional, si se desea asignar roles al crear el usuario
}
