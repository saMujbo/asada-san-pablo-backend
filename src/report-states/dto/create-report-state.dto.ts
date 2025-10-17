import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateReportStateDto {
    @ApiProperty({ example: 'Pending', description: 'Name of the report state' })
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @Length(2, 15, { message: 'Name must be between 2 and 100 characters' })
    Name: string;
}
