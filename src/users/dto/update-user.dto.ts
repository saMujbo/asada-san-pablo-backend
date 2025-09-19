
import { IsBoolean, IsDateString,IsNotEmpty,IsOptional, IsString, Length, Matches} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { toDateOnly } from 'src/utils/ToDateOnly';
export class UpdateUserDto{

        @ApiProperty()
        @Transform(({ value }) => toDateOnly(value))
        @Matches(/^\d{4}-\d{2}-\d{2}$/, {
                message: 'Birthdate debe ser YYYY-MM-DD',
        })
        Birthdate: string;

        @ApiProperty()
        @IsOptional()
        @IsString()
        PhoneNumber?: string;

        @ApiProperty()
        @IsOptional()
        @IsString()
        Address?: string;

        @ApiProperty()
        @IsBoolean()
        @IsOptional()
        IsActive?: boolean;
}

