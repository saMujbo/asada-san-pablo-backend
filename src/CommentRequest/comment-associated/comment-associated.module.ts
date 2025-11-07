import { Module } from '@nestjs/common';
import { CommentAssociatedService } from './comment-associated.service';
import { CommentAssociatedController } from './comment-associated.controller';

@Module({
  controllers: [CommentAssociatedController],
  providers: [CommentAssociatedService],
})
export class CommentAssociatedModule {}
