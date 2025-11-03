        import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
        import { CreateRequestAssociatedDto } from './create-request-associated.dto';
        import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

        export class UpdateRequestAssociatedDto {

        @ApiProperty()
        @IsOptional()
        @IsInt()
        StateRequestId?: number; // opcional: si no se envía, se usa el estado por defecto
        }
