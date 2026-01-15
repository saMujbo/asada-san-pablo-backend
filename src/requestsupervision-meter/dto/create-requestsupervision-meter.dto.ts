    import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
    import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TrimAndNullify } from 'src/utils/validation.utils';

    export class CreateRequestSupervisionMeterDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @TrimAndNullify()
    Location: string;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    NIS: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @TrimAndNullify()
    Justification: string;

    // Relaciones (FK)
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    UserId: number;

        // no debe de ir en el dto el estado 
    }


