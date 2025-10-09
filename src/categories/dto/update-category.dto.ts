import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    Name?: string;
    
    @ApiProperty()
    @IsString()
    @IsOptional()
    Description?: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    IsActive?:boolean;
}
