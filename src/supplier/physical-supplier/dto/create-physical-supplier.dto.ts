import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, MaxLength } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreatePhysicalSupplierDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'La identificacion es obligatoria' })
    @IsString({ message: 'La identificacion debe ser un texto' })
    @Length(3, 40, { message: 'La identificacion debe tener entre 3 y 40 caracteres' })
    IDcard!: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser un texto' })
    @Length(2, 120, { message: 'El nombre debe tener entre 2 y 120 caracteres' })
    Name!: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
    @IsString({ message: 'El primer apellido debe ser un texto' })
    @MaxLength(255, { message: 'El primer apellido no puede superar los 255 caracteres' })
    Surname1!: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'El segundo apellido es obligatorio' })
    @IsString({ message: 'El segundo apellido debe ser un texto' })
    @MaxLength(255, { message: 'El segundo apellido no puede superar los 255 caracteres' })
    Surname2!: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo no tiene un formato valido' })
    @MaxLength(254, { message: 'El correo no puede superar los 254 caracteres' })
    Email!: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'El numero de telefono es obligatorio' })
    @IsString({ message: 'El numero de telefono debe ser un texto' })
    @MaxLength(40, { message: 'El numero de telefono no puede superar los 40 caracteres' })
    PhoneNumber!: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'La ubicacion es obligatoria' })
    @IsString({ message: 'La ubicacion debe ser un texto' })
    Location!: string;
}
