    import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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