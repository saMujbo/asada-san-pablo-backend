import { Injectable } from '@nestjs/common';
import { CreateCommentAssociatedDto } from './dto/create-comment-associated.dto';
import { UpdateCommentAssociatedDto } from './dto/update-comment-associated.dto';

@Injectable()
export class CommentAssociatedService {
  create(createCommentAssociatedDto: CreateCommentAssociatedDto) {
    return 'This action adds a new commentAssociated';
  }

  findAll() {
    return `This action returns all commentAssociated`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commentAssociated`;
  }

  update(id: number, updateCommentAssociatedDto: UpdateCommentAssociatedDto) {
    return `This action updates a #${id} commentAssociated`;
  }

  remove(id: number) {
    return `This action removes a #${id} commentAssociated`;
  }
}
