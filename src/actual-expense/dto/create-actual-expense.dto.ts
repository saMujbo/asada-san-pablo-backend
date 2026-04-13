import { ApiProperty } from "@nestjs/swagger";
import {Type } from "class-transformer";
import { IsInt,IsString} from "class-validator";

export class CreateActualExpenseDto {

    @ApiProperty()
    @IsString() 
    Observation: string;

    @ApiProperty()
    @Type(()=> Number)
    @IsInt()
    TraceProjectId: number;
}
