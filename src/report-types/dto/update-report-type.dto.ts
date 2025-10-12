import { PartialType } from '@nestjs/swagger';
import { CreateReportTypeDto } from './create-report-type.dto';

export class UpdateReportTypeDto extends PartialType(CreateReportTypeDto) {}
