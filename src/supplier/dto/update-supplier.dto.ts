import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSupplierDto {
            @ApiProperty()
            @IsString()
            @IsOptional()
            Name: string;

            @ApiProperty()
            @IsString()
            @IsOptional()
            Email: string;

            @ApiProperty()
            @IsString()
            @IsOptional()
            PhoneNumber: string;

            @ApiProperty()
            @IsString()
            @IsOptional()
            Location: string;

            @ApiProperty()
            @IsBoolean()
            @IsOptional()
            IsActive: boolean;
}
