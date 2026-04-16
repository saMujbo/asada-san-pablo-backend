    import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
    import { Transform, Type } from 'class-transformer';
    import {
    IsString,
    IsEmail,
    IsOptional,
    IsNotEmpty,
    Matches,
    IsArray,
    ArrayUnique,
    ArrayMinSize,
    IsInt,
    IsBoolean,
    IsEnum,
    } from 'class-validator';
    import { toDateOnly } from 'src/utils/ToDateOnly';
import { TrimAndNullify } from 'src/utils/validation.utils';
import { TypeDNI } from '../enum/TypeDNI.enum';
    export class AdminCreateUserDto {
    @ApiProperty()
    @IsEnum(TypeDNI)
    @IsNotEmpty()
    TypeDNI: TypeDNI;

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty()
    IDcard: string;

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty()
    Name: string;

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty()
    Surname1: string;

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty()
    Surname2: string;
    
    @ApiProperty()
    @IsOptional()
    @IsArray()
    Nis?: number[];

    @ApiProperty()
    @IsEmail()
    @TrimAndNullify()
    @IsNotEmpty()
    Email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    PhoneNumber: string;

    @ApiProperty()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    Birthdate: string;

    @ApiProperty()
    @IsString()
    @TrimAndNullify()
    @IsNotEmpty()
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
