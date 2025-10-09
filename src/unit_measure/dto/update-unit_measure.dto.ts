import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUnitMeasureDto } from './create-unit_measure.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUnitMeasureDto extends PartialType(CreateUnitMeasureDto) {
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    IsActive?:boolean;
}
