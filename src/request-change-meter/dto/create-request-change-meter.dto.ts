import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, Matches, IsOptional, IsBoolean, IsInt, IsPositive } from "class-validator";

    export class CreateRequestChangeMeterDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Location: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    NIS:number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Justification: string;

    // Relaciones (FK)
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    UserId: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    StateRequestId: number;
    }
