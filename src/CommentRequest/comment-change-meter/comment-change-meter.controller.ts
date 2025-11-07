import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CommentChangeMeterService } from './comment-change-meter.service';
import { CreateCommentChangeMeterDto } from './dto/create-comment-change-meter.dto';

@Controller('comment-change-meter')
export class CommentChangeMeterController {
  constructor(
    private readonly commentService: CommentChangeMeterService
  ) {}

  @Post('admin/:requestId')
  async createAdminComment(
    @Param('requestId') requestId: number,
    @Body() dto: CreateCommentChangeMeterDto,
  ) {
    return this.commentService.createAdminComment(
      requestId,
      dto.Subject,
      dto.Comment
    );
  }

  @Get('by-request/:requestId')
  async findByRequest(@Param('requestId') requestId: number) {
    return this.commentService.findByRequestId(requestId);
  }
  @Get('All')
  async findAll(){
    return this.commentService.getAll();
  }
}
