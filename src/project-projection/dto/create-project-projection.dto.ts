import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateProductDetailDto } from "src/product/product-detail/dto/create-product-detail.dto";


    export class CreateProjectProjectionDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    Observation?: string;

    // Relación con Project (1:1)
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    ProjectId: number;

    // Relación con ProductDetails (1:N)
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateProductDetailDto)
    ProductDetails?: CreateProductDetailDto[];
    }
