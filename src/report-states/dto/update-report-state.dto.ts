import { PartialType } from '@nestjs/swagger';
import { CreateReportStateDto } from './create-report-state.dto';

export class UpdateReportStateDto extends PartialType(CreateReportStateDto) {}
