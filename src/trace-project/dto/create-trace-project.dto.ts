import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, Matches, IsOptional, isIn, IsInt } from "class-validator";

export class CreateTraceProjectDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Name:string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Observation:string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    ProjectId:number;
}
