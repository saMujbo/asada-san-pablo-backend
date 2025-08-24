import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty()
        // @IsNotEmpty()
        // @IsString()
        // nombre:string;
    
        // @ApiProperty()
        // @IsNotEmpty()
        // @IsString()
        // apellidos:string;
    
        // @ApiProperty()
        // @IsNotEmpty()
        // @IsString()
        // cedula: string;

    
        // @ApiProperty()
        // @IsNotEmpty()
        // @IsEmail()
        // email: string;
    
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        PhoneNumber: string;
    
        @ApiProperty({
        type: String,
        format: 'date',
        example: '1995-07-29',
        })
        @IsNotEmpty()
        @IsDate()
        Birthdate: Date;

        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        Address: string;
}
