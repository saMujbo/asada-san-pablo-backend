import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentAssociatedService } from './comment-associated.service';
import { CreateCommentAssociatedDto } from './dto/create-comment-associated.dto';
import { UpdateCommentAssociatedDto } from './dto/update-comment-associated.dto';

@Controller('comment-associated')
export class CommentAssociatedController {
  constructor(private readonly commentAssociatedService: CommentAssociatedService) {}

  @Post()
  create(@Body() createCommentAssociatedDto: CreateCommentAssociatedDto) {
    return this.commentAssociatedService.create(createCommentAssociatedDto);
  }

  @Get()
  findAll() {
    return this.commentAssociatedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentAssociatedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentAssociatedDto: UpdateCommentAssociatedDto) {
    return this.commentAssociatedService.update(+id, updateCommentAssociatedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentAssociatedService.remove(+id);
  }
}
