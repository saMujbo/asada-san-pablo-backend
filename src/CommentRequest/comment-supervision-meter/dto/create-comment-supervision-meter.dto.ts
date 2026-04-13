import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";

export class CreateCommentSupervisionMeterDto {
        @ApiProperty({ example: 'Documento faltante' })
        @IsNotEmpty()
        @IsString()
        Subject: string;
        
        @ApiProperty({ example: 'Por favor adjunte su cédula de identidad' })
        @IsNotEmpty()
        @IsString()
        Comment: string;

        @ApiProperty()
        @Type(() => Number)
        @IsInt() @Min(1)
        @IsNotEmpty()
        UserId: number;
}
