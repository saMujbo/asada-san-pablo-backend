import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsArray, IsBoolean, IsInt, IsPositive, IsNotEmpty } from "class-validator";

    export class CreateRequestChangeNameMeterDto {
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    Justification?: string;

    @IsOptional()
    @IsBoolean()
    IsActive?: boolean;

    // FK requeridas
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    UserId: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    StateRequestId: number;
    }
