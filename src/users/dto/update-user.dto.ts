import {
        ArrayMinSize,
        ArrayUnique,
        IsArray,
        IsBoolean,
        IsEmail,
        IsInt,
        IsNotEmpty,
        IsOptional,
        IsString,
        Matches,
        MaxLength,
        } from 'class-validator';
        import {ApiPropertyOptional } from '@nestjs/swagger';
        import { Transform, Type } from 'class-transformer';
        import { toDateOnly } from 'src/utils/ToDateOnly';
        import { TrimAndNullify } from 'src/utils/validation.utils';

        export class UpdateUserDto {
        @ApiPropertyOptional()
        @IsOptional()
        @IsArray()
        Nis?: number[];

        @ApiPropertyOptional()
        @IsOptional()
        @IsEmail()
        @TrimAndNullify()
        @IsNotEmpty()
        Email?: string;

        @ApiPropertyOptional()
        @IsOptional()
        @IsString()
        @TrimAndNullify()
        @IsNotEmpty()
        PhoneNumber?: string;

        @ApiPropertyOptional()
        @IsOptional()
        @Transform(({ value }) => toDateOnly(value))
        @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
        })
        @TrimAndNullify()
        @IsNotEmpty()
        Birthdate?: string;

        @ApiPropertyOptional()
        @IsOptional()
        @IsString()
        @MaxLength(255)
        @TrimAndNullify()
        @IsNotEmpty()
        Address?: string;

        @ApiPropertyOptional()
        @IsOptional()
        @IsBoolean()
        IsActive?: boolean;

        @ApiPropertyOptional({ type: [Number], description: 'IDs de roles' })
        @IsOptional()
        @Transform(({ value }) => {
        if (typeof value === 'string') {
        return value.split(',').map((v) => Number(v.trim())).filter((v) => !Number.isNaN(v));
        }
        return value;
        })
        @IsArray()
        @ArrayUnique()
        @ArrayMinSize(1)
        @Type(() => Number)
        @IsInt({ each: true })
        roleIds?: number[];
}