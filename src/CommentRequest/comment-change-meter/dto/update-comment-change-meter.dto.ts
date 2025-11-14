import { PartialType } from '@nestjs/swagger';
import { CreateCommentChangeMeterDto } from './create-comment-change-meter.dto';

export class UpdateCommentChangeMeterDto extends PartialType(CreateCommentChangeMeterDto) {}
