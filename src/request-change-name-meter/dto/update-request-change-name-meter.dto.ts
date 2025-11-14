import { PartialType } from '@nestjs/swagger';
import { CreateRequestChangeNameMeterDto } from './create-request-change-name-meter.dto';
import { IsOptional, IsString, IsArray, IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRequestChangeNameMeterDto{
        @IsOptional()
        @IsInt()
        StateRequestId: number;

        @IsOptional()
        @IsBoolean()
        CanComment?: boolean;
}
