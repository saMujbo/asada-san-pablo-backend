import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateStateRequestDto } from './create-state-request.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStateRequestDto {
            @ApiProperty()
            @IsString()
            @IsNotEmpty()
            Name:string;
    
            @ApiProperty()
            @IsString()
            @IsNotEmpty()
            Description: string;

            @ApiPropertyOptional({ description: 'Indica si el estado está activo' })
            @IsOptional()
            @IsBoolean()
            IsActive?: boolean;
}


