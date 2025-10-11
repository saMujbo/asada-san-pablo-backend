    import { PartialType } from '@nestjs/mapped-types';
    import { CreateCommentRequestDto } from './create-comment-request.dto';
    import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

    export class UpdateCommentRequestDto{
    @ApiProperty()
    @IsOptional()
    @IsString()
    Subject?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    Comment?: string;
    }
