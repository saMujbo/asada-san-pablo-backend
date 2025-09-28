import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLegalSupplierDto } from './create-legal-supplier.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLegalSupplierDto extends PartialType(CreateLegalSupplierDto) {
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;
}
