import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateProductDetailDto {
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
    @IsOptional()
    ProjectProjectionId: number;

    @ApiProperty()
    @IsInt() @Min(1)
    @IsOptional()
    ActualExpenseId: number;
}
