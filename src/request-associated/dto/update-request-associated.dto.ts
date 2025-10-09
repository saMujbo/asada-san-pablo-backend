        import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
        import { CreateRequestAssociatedDto } from './create-request-associated.dto';
        import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

        export class UpdateRequestAssociatedDto {
        @ApiProperty({ example: '1-2345-6789' })
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

        @ApiPropertyOptional({ example: 1 })
        @IsOptional()
        @IsInt()
        StateRequestId?: number; // opcional: si no se envía, se usa el estado por defecto
        }
