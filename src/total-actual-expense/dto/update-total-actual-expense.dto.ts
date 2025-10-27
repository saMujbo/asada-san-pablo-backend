import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateTotalActualExpenseDto {
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    ActualExpenseId: number;
}
