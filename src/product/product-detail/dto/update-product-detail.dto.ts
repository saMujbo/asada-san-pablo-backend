import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDetailDto{
    @ApiProperty()  
    Quantity: number;
}
