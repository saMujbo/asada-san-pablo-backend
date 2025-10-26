import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTotalActualExpenseDto {
    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    ProjectId: number;
}
