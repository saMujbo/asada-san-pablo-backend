import { PartialType } from '@nestjs/swagger';
import { CreateRequestAvailabilityWaterFileDto } from './create-request-availability-water-file.dto';

export class UpdateRequestAvailabilityWaterFileDto extends PartialType(CreateRequestAvailabilityWaterFileDto) {}
