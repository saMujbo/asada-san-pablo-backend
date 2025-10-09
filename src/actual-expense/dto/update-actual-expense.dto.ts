import { ApiProperty } from '@nestjs/swagger';
import {  IsString, IsBoolean, IsOptional } from 'class-validator';


export class UpdateActualExpenseDto {
    
        @ApiProperty()
        @IsString() 
        Observation: string;

        @ApiProperty()
        @IsBoolean()
        @IsOptional()
        IsActive?: boolean;
}
