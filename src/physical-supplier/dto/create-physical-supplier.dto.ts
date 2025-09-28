import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, MaxLength } from 'class-validator';

export class CreatePhysicalSupplierDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(3, 40)
    IDcard: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(2, 120)
    Name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(160)
    Email?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString() // o @IsPhoneNumber('CR') si aplicarás región
    @MaxLength(30)
    PhoneNumber?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(160)
    Location?: string;
}
