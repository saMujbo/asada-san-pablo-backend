import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentSupervisionMeterService } from './comment-supervision-meter.service';
import { CreateCommentSupervisionMeterDto } from './dto/create-comment-supervision-meter.dto';
import { UpdateCommentSupervisionMeterDto } from './dto/update-comment-supervision-meter.dto';

@Controller('comment-supervision-meter')
export class CommentSupervisionMeterController {
  constructor(
    private readonly commentService: CommentSupervisionMeterService
  ) {}

  @Post('admin/:requestId')
  async createAdminComment(
    @Param('requestId') requestId: number,
    @Body() dto: CreateCommentSupervisionMeterDto,
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
