import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsNumberString, Min } from "class-validator";

export class UpdateRolesUserDto{
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    Id:number;
    
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    RoleId:number;
}