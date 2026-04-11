import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { CreateProductDetailDto } from "src/product/product-detail/dto/create-product-detail.dto";


    export class CreateProjectProjectionDto {
    @ApiProperty()                                                             
    @IsOptional()                                                              
    @IsString({ message: "La observación de la proyección debe ser un texto" })    
    @MaxLength(10000, {                                                        
      message: "La observación de la proyección no puede superar los 10000 caracteres (incluyendo formato HTML)",                                       
    })                                                                         
    Observation?: string;                                                      
                                                                               
    @ApiProperty()                                                             
    @IsOptional()                                                              
    @Type(() => Number)                                                        
    @IsInt()                                                                   
    ProjectId: number;                                                         
                                                                               
    @IsOptional()                                                              
    @ValidateNested({ each: true })                                            
    @Type(() => CreateProductDetailDto)                                        
    ProductDetails?: CreateProductDetailDto[];
    }
