import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, MaxLength } from 'class-validator';

export class LoginAuthDto{
    @ApiProperty()
    @IsEmail()
    email:string;

    @ApiProperty()
    @MinLength(4)
    @MaxLength(12)
    Password:string;
}


