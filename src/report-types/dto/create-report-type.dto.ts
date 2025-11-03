import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, isNotEmpty } from "class-validator";

export class CreateReportTypeDto {
    @ApiProperty({ example: 'Plumbing', description: 'Type of the report' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    Name: string;
}
