import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min, IsNotEmpty, IsInt } from "class-validator";

export class CreateProductDetailTotalAEDto {
    @ApiProperty()
    @IsNumber() @Min(1)
    @IsNotEmpty()
    Quantity: number;

    @ApiProperty()
    @IsInt() @Min(1)
    @IsNotEmpty()
    ProductId: number;

    @ApiProperty()
    @IsInt() @Min(1)
    @IsNotEmpty()
    TotalActExpenseId: number;
}