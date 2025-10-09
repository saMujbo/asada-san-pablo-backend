import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateLegalSupplierDto {
    @ApiProperty()
    @IsString()
    @Length(3, 40)
    @IsNotEmpty()
    LegalID: string;

    @ApiProperty()
    @IsString()
    @Length(2, 160)
    @IsNotEmpty()
    CompanyName: string;

    @ApiProperty()
    @IsEmail()
    @MaxLength(160)
    @IsNotEmpty()
    Email?: string;

    @ApiProperty()
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    PhoneNumber?: string;

    @ApiProperty()
    @IsString()
    @MaxLength(160)
    @IsNotEmpty()
    Location?: string;

    @ApiProperty()
    @IsString()
    @MaxLength(160)
    @IsNotEmpty()
    WebSite?: string;
}
