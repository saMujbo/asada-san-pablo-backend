import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class UpdateRequestsupervisionMeterDto  
{
    
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        Location: string;
    
        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsPositive()
        NIS: number;
    
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        Justification: string;
    
        // Relaciones (FK)
        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsPositive()
        UserId: number;

        @ApiProperty()
        @IsNotEmpty()
        @IsInt()
        StateRequestId: number;
}
