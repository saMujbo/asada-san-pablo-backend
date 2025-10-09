import { ApiProperty, PartialType } from '@nestjs/swagger';
    import { CreateProjectProjectionDto } from './create-project-projection.dto';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDetailDto } from 'src/product/product-detail/dto/create-product-detail.dto';

    export class UpdateProjectProjectionDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    Observation?: string;

    // Relación con Project (1:1)
    @IsInt()
    ProjectId: number;

    // Relación con ProductDetails (1:N)
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateProductDetailDto)
    ProductDetails?: CreateProductDetailDto[];
    }
