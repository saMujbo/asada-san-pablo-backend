import { IsEmail, IsOptional, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto{
    @ApiProperty()
    @IsEmail()
    OldEmail: string;

    @ApiProperty()
    @IsEmail()
    @IsString()
    NewEmail: string;
}

