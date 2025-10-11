import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRequestChangeMeterDto } from './create-request-change-meter.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsInt, IsPositive, IsOptional } from 'class-validator';

export class UpdateRequestChangeMeterDto{
        @ApiProperty()
        @IsOptional()
        @IsString()
        Location: string;
        @ApiProperty()
        @IsOptional()
        @IsInt()
        NIS:number;

        @ApiProperty()
        @IsOptional()
        @IsString()
        Justification: string;

        // Relaciones (FK)
        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsOptional()
        UserId: number;

        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsOptional()
        StateRequestId: number;
}
