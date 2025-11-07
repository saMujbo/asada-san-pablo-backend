import { Controller, Get, Post, Body, Patch, Param, Delete, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, ParseIntPipe, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommentChangeNameMeterService } from './comment-change-name-meter.service';
import { CreateCommentChangeNameMeterDto } from './dto/create-comment-change-name-meter.dto';
import { UpdateCommentChangeNameMeterDto } from './dto/update-comment-change-name-meter.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { CreateCommentAssociatedDto } from '../comment-associated/dto/create-comment-associated.dto';

@Controller('comment-change-name-meter')
export class CommentChangeNameMeterController {
  constructor(
    private readonly commentService: CommentChangeNameMeterService
  ) {}

  @Post('admin/:requestId')
  async createAdminComment(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: CreateCommentChangeNameMeterDto,
  ) {
    return this.commentService.createAdminComment(
      requestId,
      dto.Subject,
      dto.Comment
    );
  }


  @Get('by-request/:requestId')
  async findByRequest(@Param('requestId', ParseIntPipe) requestId: number) {
    return this.commentService.findByRequestId(requestId);
  }
  @Get('All')
  async findAll(){
    return this.commentService.getAll();
  }


  @Post('reply/:requestId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async replyWithFiles(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: CreateCommentAssociatedDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ 
            fileType: /(jpg|jpeg|png|pdf|doc|docx)$/ 
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.commentService.replyWithFiles(
      requestId,
      dto.Subject,
      dto.Comment,
      files
    );
  }
}
