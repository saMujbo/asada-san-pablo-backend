import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRequestChangeMeterDto } from './create-request-change-meter.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsInt, IsPositive } from 'class-validator';

export class UpdateRequestChangeMeterDto{
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        Location: string;
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        NIS:number;

        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        Justification: string;

        // Relaciones (FK)
        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsPositive()
        UserId: number;

        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsPositive()
        StateRequestId: number;
}
