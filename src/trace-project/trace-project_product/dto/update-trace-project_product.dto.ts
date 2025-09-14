import { PartialType } from '@nestjs/swagger';
import { CreateTraceProjectProductDto } from './create-trace-project_product.dto';

export class UpdateTraceProjectProductDto extends PartialType(CreateTraceProjectProductDto) {}
