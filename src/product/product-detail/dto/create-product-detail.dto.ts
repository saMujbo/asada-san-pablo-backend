import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, Min } from "class-validator";

export class CreateProductDetailDto {
    
    @ApiProperty()
    Quantity: number;
    

    @ApiProperty()
    @IsInt() @Min(1)
    ProductId: number;
}
