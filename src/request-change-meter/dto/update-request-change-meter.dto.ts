import { ApiProperty} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean,IsInt, IsOptional } from 'class-validator';

export class UpdateRequestChangeMeterDto{
        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        @IsOptional()
        StateRequestId: number;

        @ApiProperty()
        @IsOptional()
        @IsBoolean()
        CanComment?: boolean;
}


