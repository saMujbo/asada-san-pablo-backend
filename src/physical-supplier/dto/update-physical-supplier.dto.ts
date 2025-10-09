import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePhysicalSupplierDto } from './create-physical-supplier.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePhysicalSupplierDto extends PartialType(CreatePhysicalSupplierDto) {
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;
}
