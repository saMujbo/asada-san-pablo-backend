import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, Matches, IsOptional, IsBoolean, IsInt, IsPositive } from "class-validator";
import { TrimAndNullify } from "src/utils/validation.utils";

    export class CreateRequestChangeMeterDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @TrimAndNullify()
    Location: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    NIS:number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @TrimAndNullify()
    Justification: string;

    // Relaciones (FK)
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    UserId: number;

    // @ApiProperty()
    // @Type(() => Number)
    // @IsInt()
    // StateRequestId: number;
    }
