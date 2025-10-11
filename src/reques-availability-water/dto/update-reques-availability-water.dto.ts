    import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

    export class UpdateRequestAvailabilityWaterDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    Justification?: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    UserId: number;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    StateRequestId: number;
    }