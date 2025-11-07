import { PartialType } from '@nestjs/swagger';
import { CreateCommentAssociatedDto } from './create-comment-associated.dto';

export class UpdateCommentAssociatedDto extends PartialType(CreateCommentAssociatedDto) {}
