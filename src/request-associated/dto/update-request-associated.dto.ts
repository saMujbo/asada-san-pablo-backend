        import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
        import { CreateRequestAssociatedDto } from './create-request-associated.dto';
        import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

        export class UpdateRequestAssociatedDto {
        @ApiProperty({ example: '1-2345-6789' })
        @IsOptional()
        @IsString()
        IDcard: string; // se usa para buscar el usuario

        @ApiProperty()
        @IsOptional()
        @IsString()
        Name: string;

        @ApiProperty()
        @IsOptional()
        @IsString()
        Justification: string;

        @ApiProperty()
        @IsOptional()
        @IsString()
        Surname1: string;

        @ApiProperty()
        @IsOptional()
        @IsString()
        Surname2: string;

        @ApiProperty()
        @IsOptional()
        NIS:number;

        @ApiPropertyOptional({ example: 1 })
        @IsOptional()
        @IsInt()
        StateRequestId?: number; // opcional: si no se envía, se usa el estado por defecto
        }
