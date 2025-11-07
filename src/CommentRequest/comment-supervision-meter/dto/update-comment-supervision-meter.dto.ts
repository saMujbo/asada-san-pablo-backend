import { PartialType } from '@nestjs/swagger';
import { CreateCommentSupervisionMeterDto } from './create-comment-supervision-meter.dto';

export class UpdateCommentSupervisionMeterDto extends PartialType(CreateCommentSupervisionMeterDto) {}
