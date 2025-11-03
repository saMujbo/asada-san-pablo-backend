import { PartialType } from '@nestjs/swagger';
import { CreateRequestAssociatedFileDto } from './create-request-associated-file.dto';

export class UpdateRequestAssociatedFileDto extends PartialType(CreateRequestAssociatedFileDto) {}
