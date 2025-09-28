import { PartialType } from '@nestjs/swagger';
import { CreateLegalSupplierDto } from './create-legal-supplier.dto';

export class UpdateLegalSupplierDto extends PartialType(CreateLegalSupplierDto) {}
