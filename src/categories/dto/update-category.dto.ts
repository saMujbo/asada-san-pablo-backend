import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiProperty({example: true})
    @IsBoolean({message: 'El estado de la categoría debe ser un booleano'})
    @IsOptional()
    IsActive?:boolean;
}
