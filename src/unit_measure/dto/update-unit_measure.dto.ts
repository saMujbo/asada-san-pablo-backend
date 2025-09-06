import { PartialType } from '@nestjs/swagger';
import { CreateUnitMeasureDto } from './create-unit_measure.dto';

export class UpdateUnitMeasureDto extends PartialType(CreateUnitMeasureDto) {}
