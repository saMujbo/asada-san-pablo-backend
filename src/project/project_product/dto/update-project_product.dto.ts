import { PartialType } from '@nestjs/swagger';
import { CreateProjectProductDto } from './create-project_product.dto';

export class UpdateProjectProductDto extends PartialType(CreateProjectProductDto) {}
