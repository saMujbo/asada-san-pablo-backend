import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateRequestsupervisionMeterDto  
{
        @ApiProperty()
        @IsInt()  
        @IsOptional()
        @IsNumber()        
        StateRequestId: number;
}
