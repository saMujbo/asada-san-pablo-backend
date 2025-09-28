import { PartialType } from '@nestjs/swagger';
import { CreatePhysicalSupplierDto } from './create-physical-supplier.dto';

export class UpdatePhysicalSupplierDto extends PartialType(CreatePhysicalSupplierDto) {}
