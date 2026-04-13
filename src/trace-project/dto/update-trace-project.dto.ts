import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional, IsBoolean } from 'class-validator';
import { toDateOnly } from 'src/utils/ToDateOnly';
import { Transform } from 'class-transformer';
import { TrimAndNullify } from 'src/utils/validation.utils';


export class UpdateTraceProjectDto{
    @ApiPropertyOptional()
    @IsOptional()
    @TrimAndNullify()
    @IsString({ message: 'El nombre del seguimiento debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre del seguimiento es requerido' })
    Name?:string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe ser YYYY-MM-DD',
    })
    date?: string;

    @ApiPropertyOptional()
    @TrimAndNullify()
    @IsString({ message: 'La observacion del seguimiento debe ser un texto' })
    @IsNotEmpty({ message: 'La observacion del seguimiento es requerida' })
    Observation?:string;

    @ApiPropertyOptional()
    @IsBoolean({ message: 'El estado debe ser true o false' })
    @IsOptional()
    IsActive?:boolean;
}
