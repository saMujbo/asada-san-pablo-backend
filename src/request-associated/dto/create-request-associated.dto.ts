    import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
    import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

    export class CreateRequestAssociatedDto {
    @ApiProperty({ example: '123456789' })
    @IsNotEmpty()
    @IsString()
    IDcard: string; // se usa para buscar el usuario

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Justification: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Surname1: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Surname2: string;

    @ApiProperty()
    @IsNotEmpty()
    NIS:number;

    // @ApiPropertyOptional({ example: 1 })
    // @IsOptional()
    // @IsInt()
    // StateRequestId?: number; // opcional: si no se envía, se usa el estado por defecto
    }
