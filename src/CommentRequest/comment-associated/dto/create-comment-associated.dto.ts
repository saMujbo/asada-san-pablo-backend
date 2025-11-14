import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";


export class CreateCommentAssociatedDto {
        @ApiProperty()
        @IsInt() @Min(1)
        @IsNotEmpty()
        RequestId: number;

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

        @ApiProperty()
        @IsInt() @Min(1)
        @IsNotEmpty()
        UserId: number;
}
