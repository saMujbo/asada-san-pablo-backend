
import { IsDateString,IsOptional, IsString, Length} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto{

        @ApiProperty()
        @IsOptional() @IsString() @Length(1, 255)
        ProfilePhoto?: string; 

        @ApiProperty()
        @IsOptional()
        @IsString()
        PhoneNumber: string;

        @ApiProperty({
        type: String,
        format: 'date',
        example: '1995-07-29',
        })
        @IsOptional()
        @IsDateString()
        Birthdate?: string;
}
