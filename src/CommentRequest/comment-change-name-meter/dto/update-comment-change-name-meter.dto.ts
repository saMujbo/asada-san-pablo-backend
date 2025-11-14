import { PartialType } from '@nestjs/swagger';
import { CreateCommentChangeNameMeterDto } from './create-comment-change-name-meter.dto';

export class UpdateCommentChangeNameMeterDto extends PartialType(CreateCommentChangeNameMeterDto) {}
