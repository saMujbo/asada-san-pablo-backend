import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, Min } from "class-validator";

export class CreateProductDetailDto {
    @ApiProperty()
    @IsNumber() @Min(1)
    Quantity: number;
    

    @ApiProperty()
    @IsInt() @Min(1)
    ProductId: number;

    @ApiProperty()
    @IsInt() @Min(1)
    ProjectProjectionId: number;
}
