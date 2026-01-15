    import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

export class CreateRequestAvailabilityWaterDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    @TrimAndNullify()
    Justification?: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    UserId: number;
}
