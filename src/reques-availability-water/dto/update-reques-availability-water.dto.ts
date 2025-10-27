    import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

    export class UpdateRequestAvailabilityWaterDto {
    @ApiProperty()
    @IsOptional()
    @IsInt()
    StateRequestId: number;
    }