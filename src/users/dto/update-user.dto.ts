
import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsDateString,IsEmail,IsInt,IsNotEmpty,IsOptional, IsString, Length, Matches} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { toDateOnly } from 'src/utils/ToDateOnly';
export class UpdateUserDto{
        @ApiProperty()
        @IsOptional()
        @IsArray()
        Nis?: number[];

        @ApiProperty()
        @IsEmail()
        @IsOptional()
        Email: string;

        @ApiProperty()
        @IsString()
        @IsOptional()
        PhoneNumber: string;

        @ApiProperty()
        @Transform(({ value }) => toDateOnly(value))
        @Matches(/^\d{4}-\d{2}-\d{2}$/, {
                message: 'Birthdate debe ser YYYY-MM-DD',
        })
        @IsOptional()
        Birthdate: string;

        @ApiProperty()
        @IsString()
        @IsOptional()
        Address: string;
        
        @ApiProperty()
        @IsBoolean()
        @IsOptional()
        IsActive?: boolean;

        @ApiPropertyOptional({ type: [Number], description: 'IDs de roles' })
        @IsOptional()
        @IsArray()
        @ArrayUnique()
        @ArrayMinSize(1)
        @Transform(({ value }) => {
                // Permite recibir "1,2,3" o [1,2,3]
                if (typeof value === 'string') {
                return value.split(',').map(v => Number(v.trim())).filter(v => !Number.isNaN(v));
                }
                return value;
        })
        @Type(() => Number)
        @IsInt({ each: true })
        roleIds?: number[];
}

