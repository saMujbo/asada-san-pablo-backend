import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRequestChangeMeterDto } from './create-request-change-meter.dto';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateRequestChangeMeterDto{
        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsOptional()
        StateRequestId: number;

        @ApiProperty()
        @IsOptional()
        @IsBoolean()
        CanComment?: boolean;
}


