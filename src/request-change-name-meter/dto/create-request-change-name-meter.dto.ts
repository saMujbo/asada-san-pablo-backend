    import { ApiProperty } from "@nestjs/swagger";
    import { IsOptional, IsString, IsArray, IsBoolean, IsInt, IsPositive, IsNotEmpty } from "class-validator";

        export class CreateRequestChangeNameMeterDto {
        
        @ApiProperty()
        @IsOptional()
        @IsString()
        Justification?: string;

        // FK requeridas
        @ApiProperty()
        @IsInt()
        @IsOptional()
        UserId: number;

        @ApiProperty()
        @IsInt()
        @IsOptional()
        StateRequestId: number;
        }
