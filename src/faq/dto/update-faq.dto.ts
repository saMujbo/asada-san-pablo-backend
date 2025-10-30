import { PartialType } from '@nestjs/swagger';
import { CreateFAQDto } from './create-faq.dto';

export class UpdateFAQDto extends PartialType(CreateFAQDto) {}
