import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, MaxLength } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreatePhysicalSupplierDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @Length(3, 40)
    IDcard: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @Length(2, 120)
    Name: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    Surname1: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    Surname2: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(160)
    Email: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    PhoneNumber: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @MaxLength(160)
    Location: string;
}
