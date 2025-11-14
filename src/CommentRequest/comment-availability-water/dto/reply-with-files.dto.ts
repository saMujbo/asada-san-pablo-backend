import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

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

    @ApiProperty()
    @Type(() => Number)
    @IsInt() @Min(1)
    @IsNotEmpty()
    UserId: number;
}