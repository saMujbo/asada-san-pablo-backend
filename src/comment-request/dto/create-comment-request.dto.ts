    import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

    export class CreateCommentRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Subject: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    Comment: string;
    
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    RequestAvailabilityWaterId: number; // Relación con RequestAvailabilityWater

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    RequestSupervisionMeterId: number; 

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    RequestChangeMeterId: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    RequestChangeNameMeterId: number;
    }
