        import { ApiProperty} from '@nestjs/swagger';
        import {IsOptional, IsBoolean, IsInt } from 'class-validator';

        export class UpdateRequestAssociatedDto {
        @ApiProperty()
        @IsOptional()
        @IsInt()
        StateRequestId?: number; 

        @ApiProperty()
        @IsOptional()
        @IsBoolean()
        CanComment?: boolean;
}
