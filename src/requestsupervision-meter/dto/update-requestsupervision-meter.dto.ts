import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateRequestsupervisionMeterDto  
{
        @ApiProperty()
        @IsInt()  
        @IsOptional()
        @IsNumber()        
        StateRequestId: number;

        @ApiProperty()
        @IsOptional()
        @IsBoolean()
        CanComment?: boolean;
}
