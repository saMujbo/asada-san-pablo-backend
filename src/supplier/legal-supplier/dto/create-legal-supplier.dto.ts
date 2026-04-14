import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreateLegalSupplierDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'La identificacion legal es obligatoria' })
    @IsString({ message: 'La identificacion legal debe ser un texto' })
    @Length(3, 40, { message: 'La identificacion legal debe tener entre 3 y 40 caracteres' })
    LegalID!: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'El nombre de empresa es obligatorio' })
    @IsString({ message: 'El nombre de empresa debe ser un texto' })
    @Length(2, 255, { message: 'El nombre de empresa debe tener entre 2 y 255 caracteres' })
    CompanyName!: string;

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

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty({ message: 'El sitio web es obligatorio' })
    @IsString({ message: 'El sitio web debe ser un texto' })
    @MaxLength(255, { message: 'El sitio web no puede superar los 255 caracteres' })
    WebSite?: string;
}