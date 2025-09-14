    import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
    import { Transform, Type } from 'class-transformer';
    import {
    IsString,
    IsEmail,
    IsDateString,
    IsOptional,
    IsNotEmpty,
    Matches,
    IsArray,
    ArrayUnique,
    ArrayMinSize,
    IsInt,
    } from 'class-validator';
    import { Role } from 'src/roles/entities/role.entity';
    import { toDateOnly } from 'src/utils/ToDateOnly';

    export class AdminCreateUserDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    IDcard: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Surname1: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Surname2: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    Nis?: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    Email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9]{8}$/, { message: 'PhoneNumber debe tener 8 dígitos numéricos' })
    PhoneNumber: string;

    @ApiProperty()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    Birthdate: string;

    @ApiProperty()
    @IsString()
    Address: string;
    
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
