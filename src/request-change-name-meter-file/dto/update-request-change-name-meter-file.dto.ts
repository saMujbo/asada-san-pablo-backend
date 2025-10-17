import { PartialType } from '@nestjs/swagger';
import { CreateRequestChangeNameMeterFileDto } from './create-request-change-name-meter-file.dto';

export class UpdateRequestChangeNameMeterFileDto extends PartialType(CreateRequestChangeNameMeterFileDto) {}
