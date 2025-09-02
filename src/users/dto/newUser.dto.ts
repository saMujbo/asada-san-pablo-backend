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
} from 'class-validator';
import { toDateOnly } from 'src/utils/ToDateOnly';

    
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
    @IsOptional() @IsString() @Length(1, 255)
    ProfilePhoto?: string;
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

    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    Birthdate: string;

    @ApiProperty()
    @IsString()
    
    Address: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    Password: string;

    @ApiProperty()
    @IsNotEmpty()
    RoleId:number;
}
