import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateStateRequestDto } from './create-state-request.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStateRequestDto {
            @ApiProperty()
            @IsString()
            @IsOptional()
            Name:string;
    
            @ApiProperty()
            @IsString()
            @IsOptional()
            Description: string;

            @ApiPropertyOptional({ description: 'Indica si el estado está activo' })
            @IsOptional()
            @IsBoolean()
            IsActive?: boolean;
}


