import { PartialType } from '@nestjs/swagger';
import { CreateMailServiceDto } from './create-mail-service.dto';

export class UpdateMailServiceDto extends PartialType(CreateMailServiceDto) {}
