import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class CreateUnitMeasureDto {
    @ApiProperty()
    @IsString() 
    Name:string;

    @ApiProperty()
    @IsBoolean()
    IsActive:boolean;
}
