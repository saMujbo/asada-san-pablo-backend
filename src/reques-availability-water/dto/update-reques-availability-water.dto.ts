    import { ApiProperty } from '@nestjs/swagger';
import {IsBoolean, IsInt,IsOptional} from 'class-validator';

    export class UpdateRequestAvailabilityWaterDto {
    @ApiProperty()
    @IsOptional()
    @IsInt()
    StateRequestId: number;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    CanComment?: boolean;
    }

