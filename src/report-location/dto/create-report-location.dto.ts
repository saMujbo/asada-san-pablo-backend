import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MIN, MinLength } from "class-validator";

export class CreateReportLocationDto {
    @ApiProperty({ example: 'San Pablo', description: 'Name of the report location' })
    @IsNotEmpty()
    @MinLength(3, { message: 'The name must be at least 3 characters long' })
    Neighborhood: string;
}
