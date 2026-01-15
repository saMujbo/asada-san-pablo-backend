    import { ApiProperty} from '@nestjs/swagger';
import { Type } from 'class-transformer';
    import {IsInt, IsNotEmpty,IsString } from 'class-validator';
import { TrimAndNullify } from 'src/utils/validation.utils';

    export class CreateRequestAssociatedDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @TrimAndNullify()
    Justification: string;

    @ApiProperty()
    @IsNotEmpty()
    NIS:number;

    // Relaciones (FK)
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    UserId: number;
}
