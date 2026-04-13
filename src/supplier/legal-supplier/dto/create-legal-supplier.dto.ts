import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreateLegalSupplierDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @Length(3, 40)
    LegalID: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @Length(2, 255)
    CompanyName: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    Email?: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    PhoneNumber?: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    Location?: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    WebSite?: string;
}