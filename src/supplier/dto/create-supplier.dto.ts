import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateSupplierDto {
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
