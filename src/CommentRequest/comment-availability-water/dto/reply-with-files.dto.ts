import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReplyWithFilesDto {
    @ApiProperty({ example: 'Documento adjunto' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    Subject: string;

    @ApiProperty({ example: 'Aquí está el documento solicitado' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(2000)
    Comment: string;
}