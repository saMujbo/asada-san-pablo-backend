import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CommentRequestService } from './comment-request.service';
import { CreateCommentRequestDto } from './dto/create-comment-request.dto';
import { UpdateCommentRequestDto } from './dto/update-comment-request.dto';

@Controller('comment-request')
export class CommentRequestController {
  constructor(private readonly commentRequestService: CommentRequestService) {}

  @Post()
  create(@Body() createCommentRequestDto: CreateCommentRequestDto) {
    return this.commentRequestService.create(createCommentRequestDto);
  }

  @Get()
  findAll() {
    return this.commentRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commentRequestService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateCommentRequestDto: UpdateCommentRequestDto) {
    return this.commentRequestService.update(id, updateCommentRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.commentRequestService.remove(id);
  }
}
