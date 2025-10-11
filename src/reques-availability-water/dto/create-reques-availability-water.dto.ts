    import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRequestAvailabilityWaterDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    Justification?: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    UserId: number;
}
