import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  Matches,
  MinLength,
  Length,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';
import { toDateOnly } from 'src/utils/ToDateOnly';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @TrimAndNullify()
  @IsNotEmpty()
  IDcard: string;

  @ApiProperty()
  @IsString()
  @TrimAndNullify()
  @IsNotEmpty()
  Name: string;

  @ApiProperty()
  @IsString()
  @TrimAndNullify()
  @IsNotEmpty()
  Surname1: string;

  @ApiProperty()
  @IsString()
  @TrimAndNullify()
  @IsNotEmpty()
  Surname2: string;
  
  @ApiProperty()
  @IsOptional()
  @IsArray()
  Nis?: number[];

  @ApiProperty()
  @IsEmail()
  @TrimAndNullify()
  @IsNotEmpty()
  Email: string;

  @ApiProperty()
  @IsString()
  @TrimAndNullify()
  @IsNotEmpty()
  //@Matches(/^[0-9]{8}$/, { message: 'PhoneNumber debe tener 8 dígitos numéricos' })
  PhoneNumber: string;

  @Transform(({ value }) => toDateOnly(value))
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Birthdate debe ser YYYY-MM-DD',
  })
  Birthdate: string;

  @ApiProperty()
  @IsString()
  @TrimAndNullify()
  @IsNotEmpty()
  @MaxLength(255)
  Address: string;

  @ApiProperty()
  @IsString()
  @TrimAndNullify()
  @IsNotEmpty()
  @MinLength(6)
  Password: string;

  @ApiProperty({ type: [Role], required: false })
  Roles?: Role[]; // Opcional, si se desea asignar roles al crear el usuario
}
