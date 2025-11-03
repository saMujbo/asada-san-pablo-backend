import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFAQDto } from './create-faq.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFAQDto extends PartialType(CreateFAQDto) {
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;
}