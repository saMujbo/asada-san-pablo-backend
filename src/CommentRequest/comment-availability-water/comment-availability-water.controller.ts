// comment-availability-water.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { CommentAvailabilityWaterService } from './comment-availability-water.service';
import { CreateAdminCommentDto } from './dto/create-admin-comment.dto';
import { ReplyWithFilesDto } from './dto/reply-with-files.dto';

@ApiTags('Comment Availability Water')
@Controller('comment-availability-water')
export class CommentAvailabilityWaterController {
  constructor(
    private readonly commentService: CommentAvailabilityWaterService
  ) {}

  @Post('admin/:requestId')
  @ApiOperation({ summary: 'Admin crea comentario (sin archivos)' })
  async createAdminComment(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: CreateAdminCommentDto,
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
    @Body() dto: ReplyWithFilesDto,
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