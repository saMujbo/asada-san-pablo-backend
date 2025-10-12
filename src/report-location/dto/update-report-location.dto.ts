import { PartialType } from '@nestjs/swagger';
import { CreateReportLocationDto } from './create-report-location.dto';

export class UpdateReportLocationDto extends PartialType(CreateReportLocationDto) {}
