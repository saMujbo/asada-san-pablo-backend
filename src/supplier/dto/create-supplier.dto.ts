import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateSupplierDto {
        @ApiProperty()
        @IsString()
        @IsOptional()
        name: string;
    
        @ApiProperty()
        @IsBoolean()
        @IsOptional()
        IsActive: boolean;
}
