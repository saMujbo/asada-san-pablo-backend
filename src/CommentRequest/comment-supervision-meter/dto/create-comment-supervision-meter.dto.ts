import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCommentSupervisionMeterDto {
        @ApiProperty({ example: 'Documento faltante' })
        @IsNotEmpty()
        @IsString()
        @MaxLength(255)
        Subject: string;
        
        @ApiProperty({ example: 'Por favor adjunte su cédula de identidad' })
        @IsNotEmpty()
        @IsString()
        @MaxLength(2000)
        Comment: string;
}
