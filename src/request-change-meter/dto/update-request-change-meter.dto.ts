import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRequestChangeMeterDto } from './create-request-change-meter.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateRequestChangeMeterDto{
        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsOptional()
        StateRequestId: number;
}


