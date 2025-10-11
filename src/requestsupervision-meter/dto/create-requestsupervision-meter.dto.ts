    import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
    import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

    export class CreateRequestSupervisionMeterDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Location: string;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    NIS: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Justification: string;

    // Relaciones (FK)
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    UserId: number;

        // no debe de ir en el dto el estado 
    }


